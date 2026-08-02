package com.a17y.mt12companion

import android.app.Activity
import android.content.Intent
import android.hardware.usb.UsbManager
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.documentfile.provider.DocumentFile
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { MaterialTheme { CompanionApp(this) } }
    }
}

@Composable
private fun CompanionApp(activity: Activity) {
    val plain = activity.getSharedPreferences("a17y", 0)
    val secure = CompanionCore.securePrefs(activity)
    var mt12Tree by remember { mutableStateOf(plain.getString("mt12Tree", null)?.let(Uri::parse)) }
    var uf2Tree by remember { mutableStateOf(plain.getString("uf2Tree", null)?.let(Uri::parse)) }
    var uf2Source by remember { mutableStateOf<Uri?>(null) }
    var status by remember { mutableStateOf("Authorize the MT12 root, save a classic PAT, then sync.") }
    var token by remember { mutableStateOf(secure.getString("classicPat", "").orEmpty()) }
    var child by remember { mutableStateOf(plain.getString("builderChild", "a17y.lua") ?: "a17y.lua") }
    var mission by remember { mutableStateOf(plain.getString("builderMission", "Build the strongest verified MT12 LUAC without regressions") ?: "Build the strongest verified MT12 LUAC without regressions") }
    var catalog by remember { mutableStateOf<JSONObject?>(null) }
    val scope = rememberCoroutineScope()

    fun keep(uri: Uri, key: String) {
        activity.contentResolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
        plain.edit().putString(key, uri.toString()).apply()
    }

    val mt12Picker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocumentTree()) { uri ->
        if (uri != null) {
            val root = DocumentFile.fromTreeUri(activity, uri)
            if (root != null && CompanionCore.validateMt12(root)) {
                keep(uri, "mt12Tree"); mt12Tree = uri; status = "Verified MT12 root authorized."
            } else status = "Rejected: choose the MT12 root containing LOGS and SCRIPTS/MODELS/RADIO."
        }
    }
    val uf2TargetPicker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocumentTree()) { uri ->
        if (uri != null) { keep(uri, "uf2Tree"); uf2Tree = uri; status = "UF2 destination authorized; target is revalidated during copy." }
    }
    val firmwarePicker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) { uf2Source = uri; status = "UF2 selected. Authorize EDGETX_UF2 and press COPY & VERIFY." }
    }

    fun runWork(block: () -> String) = scope.launch {
        status = "Working…"
        status = withContext(Dispatchers.IO) { runCatching(block).fold({ it }, { "FAILED: ${it.message}" }) }
    }
    fun sync() {
        val root = mt12Tree ?: run { status = "Authorize MT12 first."; return }
        runWork { CompanionCore.syncLogs(activity, root) }
    }
    fun usbSummary(): String {
        val manager = activity.getSystemService(UsbManager::class.java)
        return manager.deviceList.values.joinToString("\n") { "USB VID=${it.vendorId} PID=${it.productId} ${it.deviceName}" }.ifBlank { "No USB devices enumerated." }
    }

    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
        if (mt12Tree != null && token.startsWith("ghp_")) sync()
    }

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("A17Y MT12 Mobile Companion", style = MaterialTheme.typography.headlineMedium)
        Text("Android · sync, firmware and LUAC AI builder", style = MaterialTheme.typography.labelLarge)
        OutlinedTextField(value = token, onValueChange = { token = it; secure.edit().putString("classicPat", it).apply() }, label = { Text("Classic GitHub PAT (encrypted)") }, visualTransformation = androidx.compose.ui.text.input.PasswordVisualTransformation(), modifier = Modifier.fillMaxWidth())
        Button({ mt12Picker.launch(mt12Tree) }, Modifier.fillMaxWidth()) { Text("AUTHORIZE & VERIFY MT12 ROOT") }
        Button({ sync() }, Modifier.fillMaxWidth()) { Text("SYNC LOGS TO GITHUB") }
        Button({ runWork { CompanionCore.backupManifest(activity, mt12Tree ?: error("Authorize MT12 first")).toString(2) } }, Modifier.fillMaxWidth()) { Text("BUILD VERIFIED BACKUP MANIFEST") }
        Button({ status = usbSummary() }, Modifier.fillMaxWidth()) { Text("CHECK USB DEVICES") }
        HorizontalDivider()
        Text("LUAC AI Builder", style = MaterialTheme.typography.titleMedium)
        OutlinedTextField(value = child, onValueChange = { child = it; plain.edit().putString("builderChild", it).apply() }, label = { Text("Repository Lua path") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = mission, onValueChange = { mission = it; plain.edit().putString("builderMission", it).apply() }, label = { Text("AI engineering mission") }, minLines = 2, modifier = Modifier.fillMaxWidth())
        Button({ runWork { CompanionCore.runLuacAiBuilder(token, child, mission) } }, Modifier.fillMaxWidth()) { Text("RUN LUAC AI BUILDER") }
        Button({ activity.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(CompanionCore.BUILDER_ACTIONS))) }, Modifier.fillMaxWidth()) { Text("OPEN LUAC BUILDER RESULTS") }
        HorizontalDivider()
        Button({ runWork { catalog = CompanionCore.fetchCatalog(); "Firmware catalog refreshed.\n${catalog.toString()}" } }, Modifier.fillMaxWidth()) { Text("GET LATEST EDGETX & ELRS") }
        Button({ firmwarePicker.launch(arrayOf("application/octet-stream", "*/*")) }, Modifier.fillMaxWidth()) { Text("SELECT OFFICIAL EDGETX UF2") }
        Button({ uf2TargetPicker.launch(uf2Tree) }, Modifier.fillMaxWidth()) { Text("AUTHORIZE EDGETX_UF2 DRIVE") }
        Button({
            val src = uf2Source ?: run { status = "Select UF2 first."; return@Button }
            val dst = uf2Tree ?: run { status = "Authorize EDGETX_UF2 first."; return@Button }
            runWork { CompanionCore.copyUf2(activity, src, dst) }
        }, Modifier.fillMaxWidth()) { Text("COPY UF2 & VERIFY") }
        Button({ activity.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("http://10.0.0.1"))) }, Modifier.fillMaxWidth()) { Text("OPEN ELRS WI-FI FLASHER") }
        Button({ activity.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://www.expresslrs.org/quick-start/transmitters/rm-internal/"))) }, Modifier.fillMaxWidth()) { Text("OPEN MT12 ELRS BUILD GUIDE") }
        Card(Modifier.fillMaxWidth()) { Text(status, Modifier.padding(14.dp)) }
        Text("The LUAC AI builder runs the repository's deterministic A17Y Engineering Workbench, compiles with Lua 5.3, normalizes for MT12, compares the candidate, and packages the normalized .luac with evidence.", style = MaterialTheme.typography.bodySmall)
    }
}
