package com.yuitodo.iconchanger

import android.content.ComponentName
import android.content.pm.PackageManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class IconChangerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "IconChanger"

  @ReactMethod
  fun changeIcon(aliasName: String) {
    val pm = reactApplicationContext.packageManager
    val packageName = reactApplicationContext.packageName
    val aliases = listOf(
      "com.yuitodo.app.IconAlias1", "com.yuitodo.app.IconAlias2", "com.yuitodo.app.IconAlias3",
      "com.yuitodo.app.IconAlias4", "com.yuitodo.app.IconAlias5", "com.yuitodo.app.IconAlias6",
      "com.yuitodo.app.IconAlias7", "com.yuitodo.app.IconAlias8", "com.yuitodo.app.IconAlias9",
      "com.yuitodo.app.IconAlias10", "com.yuitodo.app.IconAlias11"
    )
    pm.setComponentEnabledSetting(
      ComponentName(packageName, "com.yuitodo.app.MainActivity"),
      PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP
    )
    for (alias in aliases) {
      pm.setComponentEnabledSetting(
        ComponentName(packageName, alias),
        PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP
      )
    }
    val aliasMap = mapOf(
      "icon1" to "com.yuitodo.app.IconAlias1", "icon2" to "com.yuitodo.app.IconAlias2",
      "icon3" to "com.yuitodo.app.IconAlias3", "icon4" to "com.yuitodo.app.IconAlias4",
      "icon5" to "com.yuitodo.app.IconAlias5", "icon6" to "com.yuitodo.app.IconAlias6",
      "icon7" to "com.yuitodo.app.IconAlias7", "icon8" to "com.yuitodo.app.IconAlias8",
      "icon9" to "com.yuitodo.app.IconAlias9", "icon10" to "com.yuitodo.app.IconAlias10",
      "icon11" to "com.yuitodo.app.IconAlias11"
    )
    val targetAlias = aliasMap[aliasName] ?: "com.yuitodo.app.IconAlias1"
    pm.setComponentEnabledSetting(
      ComponentName(packageName, targetAlias),
      PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP
    )
  }
}
