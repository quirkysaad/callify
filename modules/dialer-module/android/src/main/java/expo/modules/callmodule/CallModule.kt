package expo.modules.callmodule

import android.content.pm.PackageManager
import android.os.Bundle
import android.provider.CallLog
import android.telecom.TelecomManager
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise

class CallModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("CallModule")

    Events("onCallStateChanged", "onCallEnded")

    // Ask for READ_CALL_LOG permission
    AsyncFunction("requestCallLogPermission") { promise: Promise ->
      val context = appContext.reactContext ?: return@AsyncFunction promise.reject(
        "NO_CONTEXT",
        "No React context available", null
      )
      val activity = appContext.currentActivity

      if (activity == null) {
        promise.reject("NO_ACTIVITY", "No activity available to request permission", null)
        return@AsyncFunction
      }

      val permission = android.Manifest.permission.READ_CALL_LOG

      if (ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED) {
        promise.resolve(true)
      } else {
        ActivityCompat.requestPermissions(activity, arrayOf(permission), 321)
        promise.resolve(false)
      }
    }

    // Fetch call logs with pagination
    AsyncFunction("getCallLogs") { limit: Int, offset: Int, promise: Promise ->
      val context = appContext.reactContext ?: return@AsyncFunction promise.reject(
        "NO_CONTEXT",
        "No React context available",
        null
      )

      val permission = android.Manifest.permission.READ_CALL_LOG
      if (ContextCompat.checkSelfPermission(context, permission) != PackageManager.PERMISSION_GRANTED) {
        promise.reject("PERMISSION_DENIED", "Call log permission not granted", null)
        return@AsyncFunction
      }

      val callLogs = mutableListOf<Map<String, Any?>>()

      val cursor = context.contentResolver.query(
        CallLog.Calls.CONTENT_URI,
        arrayOf(
          CallLog.Calls.NUMBER,
          CallLog.Calls.CACHED_NAME,
          CallLog.Calls.TYPE,
          CallLog.Calls.DATE,
          CallLog.Calls.DURATION
        ),
        null,
        null,
        "${CallLog.Calls.DATE} DESC"
      )

      cursor?.use {
        val numberIndex = it.getColumnIndex(CallLog.Calls.NUMBER)
        val nameIndex = it.getColumnIndex(CallLog.Calls.CACHED_NAME)
        val typeIndex = it.getColumnIndex(CallLog.Calls.TYPE)
        val dateIndex = it.getColumnIndex(CallLog.Calls.DATE)
        val durationIndex = it.getColumnIndex(CallLog.Calls.DURATION)

        // Skip to offset
        var skipped = 0
        while (skipped < offset && it.moveToNext()) {
          skipped++
        }

        // Read limit entries
        var count = 0
        while (it.moveToNext() && count < limit) {
          val number = it.getString(numberIndex) ?: "Unknown"
          val type = when (it.getInt(typeIndex)) {
            CallLog.Calls.INCOMING_TYPE -> "INCOMING"
            CallLog.Calls.OUTGOING_TYPE -> "OUTGOING"
            CallLog.Calls.MISSED_TYPE -> "MISSED"
            CallLog.Calls.REJECTED_TYPE -> "REJECTED"
            else -> "UNKNOWN"
          }
          val date = it.getLong(dateIndex)
          val duration = it.getLong(durationIndex)
          val name = it.getString(nameIndex) ?: "Unknown"

          callLogs.add(
            mapOf(
              "number" to number,
              "name" to name,
              "type" to type,
              "date" to date,
              "duration" to duration
            )
          )
          count++
        }

        val hasMore = it.moveToNext()
        promise.resolve(mapOf("logs" to callLogs, "hasMore" to hasMore))
      } ?: promise.resolve(mapOf("logs" to callLogs, "hasMore" to false))
    }

    // Place call via TelecomManager so our InCallService handles it (no redirect to default dialer)
    AsyncFunction("makeCall") { phoneNumber: String, promise: Promise ->
      val context = appContext.reactContext ?: return@AsyncFunction promise.reject(
        "NO_CONTEXT",
        "No React context available", null
      )
      val activity = appContext.currentActivity

      if (activity == null) {
        promise.reject("NO_ACTIVITY", "No activity available", null)
        return@AsyncFunction
      }

      val permission = android.Manifest.permission.CALL_PHONE
      if (ContextCompat.checkSelfPermission(context, permission) != PackageManager.PERMISSION_GRANTED) {
        ActivityCompat.requestPermissions(activity, arrayOf(permission), 322)
        promise.resolve(false)
        return@AsyncFunction
      }

      try {
        val telecomManager = activity.getSystemService(android.content.Context.TELECOM_SERVICE) as TelecomManager
        val uri = android.net.Uri.fromParts("tel", phoneNumber, null)
        val extras = Bundle()
        telecomManager.placeCall(uri, extras)
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("CALL_FAILED", e.message, e)
      }
    }

    // Request Default Dialer
    AsyncFunction("requestDefaultDialer") { promise: Promise ->
      val activity = appContext.currentActivity
      if (activity == null) {
        promise.resolve(false)
        return@AsyncFunction
      }
      val telecomManager = activity.getSystemService(android.content.Context.TELECOM_SERVICE) as TelecomManager
      if (activity.packageName != telecomManager.defaultDialerPackage) {
        val intent = android.content.Intent(TelecomManager.ACTION_CHANGE_DEFAULT_DIALER)
        intent.putExtra(TelecomManager.EXTRA_CHANGE_DEFAULT_DIALER_PACKAGE_NAME, activity.packageName)
        activity.startActivity(intent)
        promise.resolve(true)
      } else {
        promise.resolve(true)
      }
    }

    // Answer
    Function("answerCall") {
      CallManager.answer()
    }

    // Reject
    Function("rejectCall") {
      CallManager.reject()
    }

    // Disconnect
    Function("disconnectCall") {
      CallManager.disconnect()
    }

    // Toggle Mute
    Function("toggleMute") { muted: Boolean ->
      CallManager.toggleMute(muted)
    }

    // Toggle Speaker
    Function("toggleSpeaker") { speaker: Boolean ->
      CallManager.toggleSpeaker(speaker)
    }

    // Toggle Hold
    Function("toggleHold") { hold: Boolean ->
      if (hold) CallManager.hold() else CallManager.unhold()
    }

    // Send DTMF tone
    Function("sendDtmf") { digit: String ->
      if (digit.isNotEmpty()) {
        CallManager.sendDtmf(digit[0])
      }
    }

    // Silence ringtone
    Function("silenceRingtone") {
      CallManager.silenceRingtone()
    }

    // Handle power button press (silence then reject)
    Function("handlePowerButton") {
      CallManager.handlePowerButton()
    }

    // Get Active Call Status (includes mute/speaker state)
    Function("getActiveCall") {
      val call = CallManager.activeCall ?: return@Function null
      val details = call.details ?: return@Function null
      val number = details.handle?.schemeSpecificPart ?: "Unknown"
      val state = call.state
      val isMuted = CallManager.isMuted()
      val audioRoute = CallManager.getAudioRoute()
      return@Function mapOf(
        "number" to number,
        "state" to state,
        "isMuted" to isMuted,
        "audioRoute" to audioRoute
      )
    }

    OnCreate {
      CallManager.listener = { call ->
        if (call == null) {
           sendEvent("onCallEnded", emptyMap<String, Any>())
        } else {
           val statusMap = mutableMapOf<String, Any>()
           statusMap["state"] = call.state
           call.details?.handle?.schemeSpecificPart?.let {
              statusMap["number"] = it
           }
           sendEvent("onCallStateChanged", statusMap)
        }
      }
    }
  }
}
