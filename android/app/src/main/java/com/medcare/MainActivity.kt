package com.medcare

import android.os.Bundle
import androidx.core.view.WindowCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "medCare"

  override fun onCreate(savedInstanceState: Bundle?) {
    // Do NOT switch away from SplashTheme before super — that blanks the logo.
    // AppTheme keeps splash as windowBackground until React paints the home UI.
    super.onCreate(savedInstanceState)
    setTheme(R.style.AppTheme)
    WindowCompat.setDecorFitsSystemWindows(window, false)
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
