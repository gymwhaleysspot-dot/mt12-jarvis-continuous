package com.a17y.mt12companion

import android.content.Context
import android.net.Uri
import android.util.Base64
import androidx.documentfile.provider.DocumentFile
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest

object CompanionCore {
    const val REPO = "gymwhaleysspot-dot/mt12-jarvis-continuous"
    const val CATALOG = "https://raw.githubusercontent.com/$REPO/main/public/device-data/releases.json"
    const val BUILDER_ACTIONS = "https://github.com/$REPO/actions/workflows/workbench.yml"

    fun securePrefs(context: Context) = EncryptedSharedPreferences.create(
        context,
        "a17y_secure",
        MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun sha256(bytes: ByteArray): String = MessageDigest.getInstance("SHA-256")
        .digest(bytes).joinToString("") { "%02x".format(it) }

    fun validateMt12(root: DocumentFile): Boolean {
        val names = root.listFiles().mapNotNull { it.name?.uppercase() }.toSet()
        return "LOGS" in names && ("SCRIPTS" in names || "MODELS" in names || "RADIO" in names)
    }

    private fun request(url: String, method: String = "GET", token: String? = null, body: ByteArray? = null): Pair<Int, ByteArray> {
        val c = URL(url).openConnection() as HttpURLConnection
        c.requestMethod = method
        c.connectTimeout = 20000
        c.readTimeout = 30000
        c.setRequestProperty("Accept", "application/vnd.github+json")
        c.setRequestProperty("X-GitHub-Api-Version", "2022-11-28")
        if (!token.isNullOrBlank()) c.setRequestProperty("Authorization", "token $token")
        if (body != null) {
            c.doOutput = true
            c.setRequestProperty("Content-Type", "application/json")
            c.outputStream.use { it.write(body) }
        }
        val code = c.responseCode
        val bytes = (if (code in 200..299) c.inputStream else c.errorStream)?.use { it.readBytes() } ?: ByteArray(0)
        c.disconnect()
        return code to bytes
    }

    fun runLuacAiBuilder(token: String, child: String, mission: String): String {
        require(token.startsWith("ghp_")) { "A classic GitHub PAT is required." }
        val cleanChild = child.trim().ifBlank { "a17y.lua" }
        require(cleanChild.endsWith(".lua", true)) { "Child must be a repository Lua path." }
        val cleanMission = mission.trim().ifBlank { "Exact deterministic MT12 LUAC release" }
        val body = JSONObject()
            .put("ref", "main")
            .put("inputs", JSONObject().put("child", cleanChild).put("mission", cleanMission))
            .toString().toByteArray()
        val (code, response) = request("https://api.github.com/repos/$REPO/actions/workflows/workbench.yml/dispatches", "POST", token, body)
        require(code == 204) { "LUAC builder dispatch HTTP $code: ${response.toString(Charsets.UTF_8).take(300)}" }
        return "LUAC AI builder started.\nSource: $cleanChild\nMission: $cleanMission\nThe normalized MT12 .luac and evidence package will appear in the newest A17Y Engineering Workbench run."
    }

    fun fetchCatalog(): JSONObject {
        val (code, bytes) = request(CATALOG)
        require(code in 200..299) { "Firmware catalog HTTP $code" }
        return JSONObject(bytes.toString(Charsets.UTF_8))
    }

    fun uploadLog(token: String, name: String, bytes: ByteArray, hash: String): String {
        require(token.startsWith("ghp_")) { "A classic GitHub PAT is required." }
        val safe = name.replace(Regex("[^A-Za-z0-9._-]"), "_")
        val path = "tests/replays/mobile-${System.currentTimeMillis()}-$safe"
        val body = JSONObject().put("message", "Import MT12 log $safe [$hash]").put("content", Base64.encodeToString(bytes, Base64.NO_WRAP)).put("branch", "main").toString().toByteArray()
        val (code, response) = request("https://api.github.com/repos/$REPO/contents/$path", "PUT", token, body)
        require(code == 201) { "GitHub upload HTTP $code: ${response.toString(Charsets.UTF_8).take(300)}" }
        val obj = JSONObject(response.toString(Charsets.UTF_8))
        require(obj.optJSONObject("content")?.optString("sha").orEmpty().isNotBlank()) { "GitHub did not confirm the uploaded blob." }
        return path
    }

    fun syncLogs(context: Context, rootUri: Uri): String {
        val root = DocumentFile.fromTreeUri(context, rootUri) ?: error("MT12 folder unavailable")
        require(validateMt12(root)) { "Selected folder does not look like an MT12 root." }
        val logs = root.findFile("LOGS") ?: error("MT12 LOGS folder missing")
        val prefs = securePrefs(context)
        val token = prefs.getString("classicPat", "").orEmpty()
        require(token.isNotBlank()) { "Save a classic GitHub PAT first." }
        val imported = prefs.getStringSet("importedHashes", emptySet())!!.toMutableSet()
        var uploaded = 0
        val lines = mutableListOf<String>()
        for (file in logs.listFiles().filter { it.isFile && it.name?.endsWith(".csv", true) == true }) {
            val bytes = context.contentResolver.openInputStream(file.uri)?.use { it.readBytes() } ?: continue
            val hash = sha256(bytes)
            if (hash in imported) { lines += "KNOWN ${file.name}"; continue }
            val path = uploadLog(token, file.name ?: "log.csv", bytes, hash)
            imported += hash
            prefs.edit().putStringSet("importedHashes", imported).apply()
            uploaded++
            lines += "UPLOADED ${file.name} → $path"
        }
        return "Uploaded $uploaded new logs.\n" + lines.joinToString("\n")
    }

    fun backupManifest(context: Context, rootUri: Uri): JSONObject {
        val root = DocumentFile.fromTreeUri(context, rootUri) ?: error("MT12 folder unavailable")
        require(validateMt12(root)) { "Selected folder does not look like an MT12 root." }
        val files = org.json.JSONArray()
        fun walk(dir: DocumentFile, prefix: String) {
            for (f in dir.listFiles()) {
                val p = if (prefix.isBlank()) f.name.orEmpty() else "$prefix/${f.name.orEmpty()}"
                if (f.isDirectory) walk(f, p) else {
                    val b = context.contentResolver.openInputStream(f.uri)?.use { it.readBytes() } ?: continue
                    files.put(JSONObject().put("path", p).put("size", b.size).put("sha256", sha256(b)))
                }
            }
        }
        walk(root, "")
        return JSONObject().put("schema", 1).put("radio", "RadioMaster MT12").put("createdAt", System.currentTimeMillis()).put("files", files)
    }

    fun copyUf2(context: Context, source: Uri, targetTree: Uri): String {
        val src = context.contentResolver.openInputStream(source)?.use { it.readBytes() } ?: error("Cannot read UF2")
        require(src.size > 100_000) { "UF2 file is unexpectedly small." }
        val target = DocumentFile.fromTreeUri(context, targetTree) ?: error("UF2 destination unavailable")
        val targetName = target.name.orEmpty().uppercase()
        require(targetName.contains("EDGETX") || target.listFiles().any { it.name.equals("INFO_UF2.TXT", true) }) { "Destination is not an EDGETX_UF2 volume." }
        val out = target.createFile("application/octet-stream", "firmware.uf2") ?: error("Cannot create firmware.uf2")
        context.contentResolver.openOutputStream(out.uri, "w")!!.use { it.write(src) }
        val written = context.contentResolver.openInputStream(out.uri)!!.use { it.readBytes() }
        require(sha256(src) == sha256(written)) { "UF2 verification failed after copy." }
        return "UF2 copied and verified: ${sha256(src)}"
    }
}
