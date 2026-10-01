package com.medcare

import android.graphics.Color
import android.os.Bundle
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat
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
    // Match app tab bar container — solid white system navigation strip
    window.navigationBarColor = Color.WHITE
    WindowInsetsControllerCompat(window, window.decorView).apply {
      isAppearanceLightNavigationBars = true
      isAppearanceLightStatusBars = true
    }
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
