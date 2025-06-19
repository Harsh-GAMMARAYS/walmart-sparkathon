//package com.techmania.frontendmobile.ui.theme
//
//import android.app.Activity
//import android.os.Build
//import androidx.compose.foundation.isSystemInDarkTheme
//import androidx.compose.material3.MaterialTheme
//import androidx.compose.material3.darkColorScheme
//import androidx.compose.material3.dynamicDarkColorScheme
//import androidx.compose.material3.dynamicLightColorScheme
//import androidx.compose.material3.lightColorScheme
//import androidx.compose.runtime.Composable
//import androidx.compose.ui.platform.LocalContext
//import androidx.compose.foundation.isSystemInDarkTheme
//import androidx.compose.material3.lightColorScheme
//import androidx.compose.runtime.SideEffect
//import androidx.compose.ui.graphics.toArgb
//import androidx.compose.ui.platform.LocalView
//import androidx.core.view.WindowCompat
//import androidx.compose.ui.graphics.Color
////
////private val DarkColorScheme = darkColorScheme(
////    primary = Purple80,
////    secondary = PurpleGrey80,
////    tertiary = Pink80
////)
////
////private val LightColorScheme = lightColorScheme(
////    primary = Purple40,
////    secondary = PurpleGrey40,
////    tertiary = Pink40
////
////    /* Other default colors to override
////    background = Color(0xFFFFFBFE),
////    surface = Color(0xFFFFFBFE),
////    onPrimary = Color.White,
////    onSecondary = Color.White,
////    onTertiary = Color.White,
////    onBackground = Color(0xFF1C1B1F),
////    onSurface = Color(0xFF1C1B1F),
////    */
////)
////
////@Composable
////fun FrontendMobileTheme(
////    darkTheme: Boolean = isSystemInDarkTheme(),
////    // Dynamic color is available on Android 12+
////    dynamicColor: Boolean = true,
////    content: @Composable () -> Unit
////) {
////    val colorScheme = when {
////        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
////            val context = LocalContext.current
////            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
////        }
////
////        darkTheme -> DarkColorScheme
////        else -> LightColorScheme
////    }
////
////    MaterialTheme(
////        colorScheme = colorScheme,
////        typography = Typography,
////        content = content
////    )
////}
//// Define our light color scheme using the Walmart brand colors
//private val WalmartLightColorScheme = lightColorScheme(
//    primary = WalmartBlue,          // Main color for buttons, interactive elements
//    secondary = WalmartDarkBlue,    // A secondary accent color
//    tertiary = WalmartYellow,       // A tertiary accent color
//    background = WalmartLightGray,  // Background for screens
//    surface = Color.White,          // Background for cards, dialogs
//    onPrimary = Color.White,        // Text color on top of primary color (e.g., on a blue button)
//    onSecondary = Color.White,
//    onTertiary = Color.Black,
//    onBackground = Color.Black,     // Main text color
//    onSurface = Color.Black         // Text color on cards
//)
//
//// We won't define a dark theme for this hackathon project
//// private val DarkColorScheme = ...
//
//@Composable
//fun WalmartAppTheme( // We can rename our theme function
//    darkTheme: Boolean = isSystemInDarkTheme(),
//    content: @Composable () -> Unit
//) {
//    val colorScheme = WalmartLightColorScheme // Always use our light scheme
//
//    val view = LocalView.current
//    if (!view.isInEditMode) {
//        SideEffect {
//            val window = (view.context as Activity).window
//            window.statusBarColor = colorScheme.primary.toArgb()
//            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = darkTheme
//        }
//    }
//
//    MaterialTheme(
//        colorScheme = colorScheme,
//        typography = Typography, // Assumes you have a Typography.kt file
//        content = content
//    )
//}






package com.techmania.frontendmobile.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

// --- Walmart Brand Colors (declare ONLY here!) ---
val WalmartBlue = Color(0xFF0071CE)
val WalmartYellow = Color(0xFFFFC120)
val WalmartDarkBlue = Color(0xFF005493)
val WalmartSurface = Color(0xFFF5F5F5)
val WalmartOnBlue = Color.White
val WalmartOnYellow = Color.Black

// --- Color Schemes ---
private val LightColorScheme = lightColorScheme(
    primary = WalmartBlue,
    onPrimary = WalmartOnBlue,
    secondary = WalmartYellow,
    onSecondary = WalmartOnYellow,
    background = WalmartSurface,
    onBackground = Color.Black,
    surface = Color.White,
    onSurface = Color.Black,
)

private val DarkColorScheme = darkColorScheme(
    primary = WalmartBlue,
    onPrimary = WalmartOnBlue,
    secondary = WalmartYellow,
    onSecondary = WalmartOnYellow,
    background = Color(0xFF121212),
    onBackground = Color.White,
    surface = Color(0xFF1E1E1E),
    onSurface = Color.White,
)

// --- Typography ---
val WalmartTypography = Typography(
    displayLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 32.sp
    ),
    headlineLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 24.sp
    ),
    titleLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 20.sp
    ),
    bodyLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp
    ),
    labelLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp
    ),
    titleMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 18.sp
    ),
    labelSmall = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp
    )
)

// --- Theme Composable ---
@Composable
fun WalmartAppTheme(
    useDarkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colors = if (useDarkTheme) DarkColorScheme else LightColorScheme
    MaterialTheme(
        colorScheme = colors,
        typography = WalmartTypography,
        content = content
    )
}
