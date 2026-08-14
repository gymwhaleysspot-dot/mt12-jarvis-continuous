package com.a17y.mt12companion

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.work.CoroutineWorker
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class UsbAttachReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == "android.hardware.usb.action.USB_DEVICE_ATTACHED") {
            WorkManager.getInstance(context).enqueueUniqueWork(
                "mt12-usb-sync",
                ExistingWorkPolicy.REPLACE,
                OneTimeWorkRequestBuilder<Mt12SyncWorker>().build()
            )
        }
    }
}

class Mt12SyncWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val prefs = applicationContext.getSharedPreferences("a17y", 0)
        val uri = prefs.getString("mt12Tree", null)?.let(Uri::parse) ?: return@withContext Result.success()
        val token = CompanionCore.securePrefs(applicationContext).getString("classicPat", "").orEmpty()
        if (!token.startsWith("ghp_")) return@withContext Result.success()
        runCatching { CompanionCore.syncLogs(applicationContext, uri) }
            .fold({ Result.success() }, { Result.retry() })
    }
}
