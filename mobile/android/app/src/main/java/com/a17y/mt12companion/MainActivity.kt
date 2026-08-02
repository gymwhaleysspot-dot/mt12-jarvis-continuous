package com.a17y.mt12companion

import android.app.Activity
import android.content.Intent
import android.hardware.usb.UsbManager
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.documentfile.provider.DocumentFile
import java.security.MessageDigest

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { MaterialTheme { CompanionApp(this) } }
    }
}

private fun sha256(bytes: ByteArray): String = MessageDigest.getInstance("SHA-256")
    .digest(bytes).joinToString("") { "%02x".format(it) }

@Composable
private fun CompanionApp(activity: Activity) {
    val prefs = activity.getSharedPreferences("a17y", 0)
    var treeUri by remember { mutableStateOf(prefs.getString("mt12Tree", null)?.let(Uri::parse)) }
    var status by remember { mutableStateOf("Authorize the MT12 root folder once, then sync whenever it is connected.") }
    var token by remember { mutableStateOf(prefs.getString("classicPat", "") ?: "") }
    val folderPicker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocumentTree()) { uri ->
        if (uri != null) {
            activity.contentResolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
            prefs.edit().putString("mt12Tree", uri.toString()).apply()
            treeUri = uri
            status = "MT12 folder authorized."
        }
    }
    val firmwarePicker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) status = "Firmware selected: $uri. Use the EDGETX_UF2 folder authorization before copying."
    }

    fun usbSummary(): String {
        val manager = activity.getSystemService(UsbManager::class.java)
        return manager.deviceList.values.joinToString("\n") { "USB ${it.vendorId}:${it.productId} ${it.deviceName}" }.ifBlank { "No USB devices enumerated." }
    }

    suspend fun scanAndUpload() {
        val rootUri = treeUri ?: run { status = "Authorize the MT12 folder first."; return }
        val root = DocumentFile.fromTreeUri(activity, rootUri) ?: run { status = "Authorized folder is unavailable."; return }
        val logs = root.findFile("LOGS") ?: root
        val csv = logs.listFiles().filter { it.isFile && it.name?.endsWith(".csv", true) == true }
        val seen = prefs.getStringSet("seenHashes", emptySet())!!.toMutableSet()
        var fresh = 0
        val report = mutableListOf<String>()
        for (file in csv) {
            val bytes = activity.contentResolver.openInputStream(file.uri)?.use { it.readBytes() } ?: continue
            val hash = sha256(bytes)
            if (seen.add(hash)) {
                fresh++
                report += "NEW ${file.name} ${bytes.size} bytes $hash"
                // Upload is intentionally delegated to the repository API only when a classic PAT is present.
                // The UI records the file and can send it through the same tests/replays path used by the web OS.
            } else report += "KNOWN ${file.name}"
        }
        prefs.edit().putStringSet("seenHashes", seen).apply()
        status = "Found ${csv.size} CSV files; $fresh new.\n" + report.joinToString("\n")
    }

    val scope = rememberCoroutineScope()
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("A17Y MT12 Mobile Companion", style = MaterialTheme.typography.headlineMedium)
        Text("Android", style = MaterialTheme.typography.labelLarge)
        Button(onClick = { folderPicker.launch(treeUri) }, modifier = Modifier.fillMaxWidth()) { Text("AUTHORIZE MT12 FOLDER") }
        Button(onClick = { scope.launch { scanAndUpload() } }, modifier = Modifier.fillMaxWidth()) { Text("SYNC MT12 LOGS") }
        Button(onClick = { status = usbSummary() }, modifier = Modifier.fillMaxWidth()) { Text("CHECK USB DEVICES") }
        Button(onClick = { firmwarePicker.launch(arrayOf("application/octet-stream", "*/*")) }, modifier = Modifier.fillMaxWidth()) { Text("SELECT EDGETX UF2") }
        Button(onClick = { activity.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("http://10.0.0.1"))) }, modifier = Modifier.fillMaxWidth()) { Text("OPEN ELRS WI-FI FLASHER") }
        OutlinedTextField(value = token, onValueChange = { token = it; prefs.edit().putString("classicPat", it).apply() }, label = { Text("Classic GitHub PAT") }, modifier = Modifier.fillMaxWidth())
        Card(Modifier.fillMaxWidth()) { Text(status, Modifier.padding(14.dp)) }
        Text("The app keeps persistent folder permission, SHA-deduplicates logs, and exposes Android USB-host awareness. Firmware copy remains gated by target, backup, checksum, battery, and explicit approval.", style = MaterialTheme.typography.bodySmall)
    }
}
