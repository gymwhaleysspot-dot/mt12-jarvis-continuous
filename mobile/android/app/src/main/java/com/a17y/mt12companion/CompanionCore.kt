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
    const val LOG_INDEX = "https://raw.githubusercontent.com/$REPO/main/public/control-data/log-hashes.json"
    const val BUILDER_ACTIONS = "https://github.com/$REPO/actions/workflows/workbench.yml"

    fun securePrefs(context: Context) = EncryptedSharedPreferences.create(context,"a17y_secure",MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM)
    fun sha256(bytes: ByteArray): String = MessageDigest.getInstance("SHA-256").digest(bytes).joinToString("") { "%02x".format(it) }
    fun validateMt12(root: DocumentFile): Boolean { val names=root.listFiles().mapNotNull{it.name?.uppercase()}.toSet();return "LOGS" in names&&("SCRIPTS" in names||"MODELS" in names||"RADIO" in names) }
    private fun request(url:String,method:String="GET",token:String?=null,body:ByteArray?=null):Pair<Int,ByteArray>{val c=URL(url).openConnection()as HttpURLConnection;c.requestMethod=method;c.connectTimeout=20000;c.readTimeout=30000;c.setRequestProperty("Accept","application/vnd.github+json");c.setRequestProperty("X-GitHub-Api-Version","2022-11-28");if(!token.isNullOrBlank())c.setRequestProperty("Authorization","token $token");if(body!=null){c.doOutput=true;c.setRequestProperty("Content-Type","application/json");c.outputStream.use{it.write(body)}};val code=c.responseCode;val bytes=(if(code in 200..299)c.inputStream else c.errorStream)?.use{it.readBytes()}?:ByteArray(0);c.disconnect();return code to bytes}

    fun runLuacAiBuilder(token:String,child:String,mission:String):String{
        require(token.startsWith("ghp_")){"A classic GitHub PAT is required."}
        val cleanChild=child.trim();if(cleanChild.isNotBlank())require(cleanChild.endsWith(".lua",true)&&!cleanChild.startsWith("protected/")&&!cleanChild.startsWith(".github/")&&!cleanChild.startsWith("toolchain/")&&cleanChild!="a17y.lua"){"Existing candidates must be a safe repository Lua path; leave blank for AI generation from protected A17Y."}
        val cleanMission=mission.trim().ifBlank{"Build the strongest verified MT12 LUAC without regressions"}
        val inputs=JSONObject().put("child",cleanChild).put("mission",cleanMission).put("generate",if(cleanChild.isBlank())"true" else "false")
        val body=JSONObject().put("ref","main").put("inputs",inputs).toString().toByteArray()
        val(code,response)=request("https://api.github.com/repos/$REPO/actions/workflows/workbench.yml/dispatches","POST",token,body)
        require(code==204){"LUAC builder dispatch HTTP $code: ${response.toString(Charsets.UTF_8).take(300)}"}
        return "Full LUAC AI pipeline started.\nMode: ${if(cleanChild.isBlank())"AI diagnosis, generation and repair" else "verify existing candidate"}\nMission: $cleanMission"
    }
    fun fetchCatalog():JSONObject{val(code,bytes)=request(CATALOG);require(code in 200..299){"Firmware catalog HTTP $code"};return JSONObject(bytes.toString(Charsets.UTF_8))}
    fun repositoryLogHashes():Set<String>{val(code,bytes)=request(LOG_INDEX);if(code !in 200..299)return emptySet();val a=JSONObject(bytes.toString(Charsets.UTF_8)).optJSONArray("files")?:return emptySet();return buildSet{for(i in 0 until a.length())add(a.getJSONObject(i).optString("sha256"))}}
    fun officialFirmwareMatch(catalog:JSONObject,fileName:String,hash:String):Boolean{fun scan(v:Any?):Boolean=when(v){is JSONObject->v.keys().asSequence().any{val x=v.get(it);if(it.equals("sha256",true)&&v.optString("name").equals(fileName,true)&&v.optString(it).equals(hash,true))true else scan(x)};is org.json.JSONArray->(0 until v.length()).any{scan(v.get(it))};else->false};return scan(catalog)}
    fun uploadLog(token:String,name:String,bytes:ByteArray,hash:String):String{require(token.startsWith("ghp_")){"A classic GitHub PAT is required."};require(hash !in repositoryLogHashes()){"This log already exists in the repository."};val safe=name.replace(Regex("[^A-Za-z0-9._-]"),"_");val path="tests/replays/mobile-${System.currentTimeMillis()}-$safe";val body=JSONObject().put("message","Import MT12 log $safe [$hash]").put("content",Base64.encodeToString(bytes,Base64.NO_WRAP)).put("branch","main").toString().toByteArray();val(code,response)=request("https://api.github.com/repos/$REPO/contents/$path","PUT",token,body);require(code==201){"GitHub upload HTTP $code: ${response.toString(Charsets.UTF_8).take(300)}"};require(JSONObject(response.toString(Charsets.UTF_8)).optJSONObject("content")?.optString("sha").orEmpty().isNotBlank()){"GitHub did not confirm the uploaded blob."};return path}
    fun syncLogs(context:Context,rootUri:Uri):String{val root=DocumentFile.fromTreeUri(context,rootUri)?:error("MT12 folder unavailable");require(validateMt12(root)){"Selected folder does not look like an MT12 root."};val logs=root.findFile("LOGS")?:error("MT12 LOGS folder missing");val prefs=securePrefs(context);val token=prefs.getString("classicPat","").orEmpty();require(token.isNotBlank()){"Save a classic GitHub PAT first."};val imported=prefs.getStringSet("importedHashes",emptySet())!!.toMutableSet();val remote=repositoryLogHashes();var uploaded=0;val lines=mutableListOf<String>();for(file in logs.listFiles().filter{it.isFile&&it.name?.endsWith(".csv",true)==true}){val bytes=context.contentResolver.openInputStream(file.uri)?.use{it.readBytes()}?:continue;val hash=sha256(bytes);if(hash in imported||hash in remote){lines+="KNOWN ${file.name}";imported+=hash;continue};val path=uploadLog(token,file.name?:"log.csv",bytes,hash);imported+=hash;prefs.edit().putStringSet("importedHashes",imported).apply();uploaded++;lines+="UPLOADED ${file.name} → $path"};return "Uploaded $uploaded new logs.\n"+lines.joinToString("\n")}
    fun backupManifest(context:Context,rootUri:Uri):JSONObject{val root=DocumentFile.fromTreeUri(context,rootUri)?:error("MT12 folder unavailable");require(validateMt12(root)){"Selected folder does not look like an MT12 root."};val files=org.json.JSONArray();fun walk(dir:DocumentFile,prefix:String){for(f in dir.listFiles()){val p=if(prefix.isBlank())f.name.orEmpty()else"$prefix/${f.name.orEmpty()}";if(f.isDirectory)walk(f,p)else{val b=context.contentResolver.openInputStream(f.uri)?.use{it.readBytes()}?:continue;files.put(JSONObject().put("path",p).put("size",b.size).put("sha256",sha256(b)))}}};walk(root,"");return JSONObject().put("schema",2).put("radio","RadioMaster MT12").put("createdAt",System.currentTimeMillis()).put("files",files)}
    fun copyUf2(context:Context,source:Uri,targetTree:Uri,catalog:JSONObject?=null,sourceName:String?=null):String{val src=context.contentResolver.openInputStream(source)?.use{it.readBytes()}?:error("Cannot read UF2");require(src.size>100_000){"UF2 file is unexpectedly small."};val hash=sha256(src);if(catalog!=null&&sourceName!=null)require(officialFirmwareMatch(catalog,sourceName,hash)){"Firmware is not cryptographically matched to the official catalog."};val target=DocumentFile.fromTreeUri(context,targetTree)?:error("UF2 destination unavailable");require(target.name.orEmpty().uppercase().contains("EDGETX")||target.listFiles().any{it.name.equals("INFO_UF2.TXT",true)}){"Destination is not an EDGETX_UF2 volume."};val out=target.createFile("application/octet-stream","firmware.uf2")?:error("Cannot create firmware.uf2");context.contentResolver.openOutputStream(out.uri,"w")!!.use{it.write(src)};val written=context.contentResolver.openInputStream(out.uri)!!.use{it.readBytes()};require(hash==sha256(written)){"UF2 verification failed after copy."};return "UF2 copied and verified: $hash"}
}
