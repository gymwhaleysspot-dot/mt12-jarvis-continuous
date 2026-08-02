package com.a17y.mt12companion

import android.content.Context
import android.net.Uri
import android.util.Base64
import androidx.documentfile.provider.DocumentFile
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest

object CompanionCore {
    const val REPO = "gymwhaleysspot-dot/mt12-jarvis-continuous"
    const val CATALOG = "https://raw.githubusercontent.com/$REPO/main/public/device-data/releases.json"
    const val LOG_INDEX = "https://raw.githubusercontent.com/$REPO/main/public/control-data/log-hashes.json"
    const val BUILDER_ACTIONS = "https://github.com/$REPO/actions/workflows/workbench.yml"

    fun securePrefs(context: Context) = EncryptedSharedPreferences.create(
        context,
        "a17y_secure",
        MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun sha256(bytes: ByteArray): String = MessageDigest.getInstance("SHA-256")
        .digest(bytes)
        .joinToString("") { "%02x".format(it) }

    fun validateMt12(root: DocumentFile): Boolean {
        val names = root.listFiles().mapNotNull { it.name?.uppercase() }.toSet()
        return "LOGS" in names && ("SCRIPTS" in names || "MODELS" in names || "RADIO" in names)
    }

    private fun request(
        url: String,
        method: String = "GET",
        token: String? = null,
        body: ByteArray? = null
    ): Pair<Int, ByteArray> {
        val connection = URL(url).openConnection() as HttpURLConnection
        connection.requestMethod = method
        connection.connectTimeout = 20_000
        connection.readTimeout = 30_000
        connection.setRequestProperty("Accept", "application/vnd.github+json")
        connection.setRequestProperty("X-GitHub-Api-Version", "2022-11-28")
        if (!token.isNullOrBlank()) connection.setRequestProperty("Authorization", "token $token")
        if (body != null) {
            connection.doOutput = true
            connection.setRequestProperty("Content-Type", "application/json")
            connection.outputStream.use { it.write(body) }
        }
        val code = connection.responseCode
        val bytes = (if (code in 200..299) connection.inputStream else connection.errorStream)
            ?.use { it.readBytes() } ?: ByteArray(0)
        connection.disconnect()
        return code to bytes
    }

    fun runLuacAiBuilder(token: String, child: String, mission: String): String {
        require(token.startsWith("ghp_")) { "A classic GitHub PAT is required." }
        val cleanChild = child.trim()
        if (cleanChild.isNotBlank()) {
            val protected = cleanChild == "a17y.lua" || cleanChild.startsWith("protected/") ||
                cleanChild.startsWith(".github/") || cleanChild.startsWith("toolchain/")
            require(cleanChild.endsWith(".lua", ignoreCase = true) && !protected) {
                "Use a safe candidate Lua path or leave blank for AI generation from protected A17Y."
            }
        }
        val cleanMission = mission.trim().ifBlank {
            "Build the strongest verified MT12 LUAC without regressions"
        }
        val inputs = JSONObject()
            .put("child", cleanChild)
            .put("mission", cleanMission)
            .put("generate", if (cleanChild.isBlank()) "true" else "false")
        val body = JSONObject().put("ref", "main").put("inputs", inputs).toString().toByteArray()
        val (code, response) = request(
            "https://api.github.com/repos/$REPO/actions/workflows/workbench.yml/dispatches",
            "POST",
            token,
            body
        )
        require(code == 204) {
            "LUAC builder dispatch HTTP $code: ${response.toString(Charsets.UTF_8).take(300)}"
        }
        val mode = if (cleanChild.isBlank()) "AI diagnosis, generation and repair" else "verify existing candidate"
        return "Full LUAC AI pipeline started.\nMode: $mode\nMission: $cleanMission"
    }

    fun fetchCatalog(): JSONObject {
        val (code, bytes) = request(CATALOG)
        require(code in 200..299) { "Firmware catalog HTTP $code" }
        return JSONObject(bytes.toString(Charsets.UTF_8))
    }

    fun repositoryLogHashes(): Set<String> {
        val (code, bytes) = request(LOG_INDEX)
        if (code !in 200..299) return emptySet()
        val files = JSONObject(bytes.toString(Charsets.UTF_8)).optJSONArray("files") ?: return emptySet()
        return buildSet {
            for (index in 0 until files.length()) add(files.getJSONObject(index).optString("sha256"))
        }
    }

    fun officialFirmwareMatch(catalog: JSONObject, fileName: String, hash: String): Boolean {
        fun scan(value: Any?): Boolean {
            return when (value) {
                is JSONObject -> {
                    val name = value.optString("name")
                    val digest = value.optString("sha256")
                    if (name.equals(fileName, ignoreCase = true) && digest.equals(hash, ignoreCase = true)) {
                        true
                    } else {
                        value.keys().asSequence().any { scan(value.opt(it)) }
                    }
                }
                is JSONArray -> (0 until value.length()).any { scan(value.opt(it)) }
                else -> false
            }
        }
        return scan(catalog)
    }

    fun uploadLog(token: String, name: String, bytes: ByteArray, hash: String): String {
        require(token.startsWith("ghp_")) { "A classic GitHub PAT is required." }
        require(hash !in repositoryLogHashes()) { "This log already exists in the repository." }
        val safe = name.replace(Regex("[^A-Za-z0-9._-]"), "_")
        val path = "tests/replays/mobile-${System.currentTimeMillis()}-$safe"
        val body = JSONObject()
            .put("message", "Import MT12 log $safe [$hash]")
            .put("content", Base64.encodeToString(bytes, Base64.NO_WRAP))
            .put("branch", "main")
            .toString().toByteArray()
        val (code, response) = request("https://api.github.com/repos/$REPO/contents/$path", "PUT", token, body)
        require(code == 201) { "GitHub upload HTTP $code: ${response.toString(Charsets.UTF_8).take(300)}" }
        val confirmed = JSONObject(response.toString(Charsets.UTF_8))
            .optJSONObject("content")?.optString("sha").orEmpty()
        require(confirmed.isNotBlank()) { "GitHub did not confirm the uploaded blob." }
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
        val remote = repositoryLogHashes()
        var uploaded = 0
        val lines = mutableListOf<String>()
        for (file in logs.listFiles().filter { it.isFile && it.name?.endsWith(".csv", true) == true }) {
            val bytes = context.contentResolver.openInputStream(file.uri)?.use { it.readBytes() } ?: continue
            val hash = sha256(bytes)
            if (hash in imported || hash in remote) {
                lines += "KNOWN ${file.name}"
                imported += hash
                continue
            }
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
        val files = JSONArray()
        fun walk(dir: DocumentFile, prefix: String) {
            for (file in dir.listFiles()) {
                val name = file.name.orEmpty()
                val relative = if (prefix.isBlank()) name else "$prefix/$name"
                if (file.isDirectory) {
                    walk(file, relative)
                } else {
                    val bytes = context.contentResolver.openInputStream(file.uri)?.use { it.readBytes() } ?: continue
                    files.put(JSONObject().put("path", relative).put("size", bytes.size).put("sha256", sha256(bytes)))
                }
            }
        }
        walk(root, "")
        return JSONObject()
            .put("schema", 2)
            .put("radio", "RadioMaster MT12")
            .put("createdAt", System.currentTimeMillis())
            .put("files", files)
    }

    fun copyUf2(
        context: Context,
        source: Uri,
        targetTree: Uri,
        catalog: JSONObject? = null,
        sourceName: String? = null
    ): String {
        val sourceBytes = context.contentResolver.openInputStream(source)?.use { it.readBytes() }
            ?: error("Cannot read UF2")
        require(sourceBytes.size > 100_000) { "UF2 file is unexpectedly small." }
        val sourceHash = sha256(sourceBytes)
        if (catalog != null && sourceName != null) {
            require(officialFirmwareMatch(catalog, sourceName, sourceHash)) {
                "Firmware is not cryptographically matched to the official catalog."
            }
        }
        val target = DocumentFile.fromTreeUri(context, targetTree) ?: error("UF2 destination unavailable")
        val isUf2 = target.name.orEmpty().uppercase().contains("EDGETX") ||
            target.listFiles().any { it.name.equals("INFO_UF2.TXT", true) }
        require(isUf2) { "Destination is not an EDGETX_UF2 volume." }
        val output = target.createFile("application/octet-stream", "firmware.uf2")
            ?: error("Cannot create firmware.uf2")
        context.contentResolver.openOutputStream(output.uri, "w")!!.use { it.write(sourceBytes) }
        val written = context.contentResolver.openInputStream(output.uri)!!.use { it.readBytes() }
        require(sourceHash == sha256(written)) { "UF2 verification failed after copy." }
        return "UF2 copied and verified: $sourceHash"
    }
}
