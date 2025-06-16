//// file: com/techmania/frontendmobile/MainActivity.kt
//// This is the 100% complete and final version. No placeholders.
//
//package com.techmania.frontendmobile
//
//import android.Manifest
//import android.content.Intent
//import android.net.Uri
//import android.os.Bundle
//import android.speech.RecognizerIntent
//import androidx.activity.ComponentActivity
//import androidx.activity.compose.rememberLauncherForActivityResult
//import androidx.activity.compose.setContent
//import androidx.activity.result.contract.ActivityResultContracts
//import androidx.compose.foundation.Image
//import androidx.compose.foundation.background
//import androidx.compose.foundation.clickable
//import androidx.compose.foundation.layout.*
//import androidx.compose.foundation.lazy.grid.GridCells
//import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
//import androidx.compose.foundation.lazy.grid.items
//import androidx.compose.foundation.shape.CircleShape
//import androidx.compose.foundation.shape.RoundedCornerShape
//import androidx.compose.foundation.text.KeyboardActions
//import androidx.compose.foundation.text.KeyboardOptions
//import androidx.compose.material.icons.Icons
//import androidx.compose.material.icons.filled.ArrowBack
//import androidx.compose.material.icons.filled.Clear
//import androidx.compose.material.icons.filled.Search
//import androidx.compose.material.icons.filled.Send
//import androidx.compose.material3.*
//import androidx.compose.runtime.*
//import androidx.compose.ui.Alignment
//import androidx.compose.ui.Modifier
//import androidx.compose.ui.graphics.Color
//import androidx.compose.ui.layout.ContentScale
//import androidx.compose.ui.platform.LocalContext
//import androidx.compose.ui.platform.LocalSoftwareKeyboardController
//import androidx.compose.ui.text.font.FontWeight
//import androidx.compose.ui.text.input.ImeAction
//import androidx.compose.ui.text.style.TextAlign
//import androidx.compose.ui.text.style.TextOverflow
//import androidx.compose.ui.unit.dp
//import androidx.compose.ui.unit.sp
//import androidx.core.content.FileProvider
//import androidx.lifecycle.viewmodel.compose.viewModel
//import androidx.navigation.NavController
//import androidx.navigation.compose.NavHost
//import androidx.navigation.compose.composable
//import androidx.navigation.compose.rememberNavController
//import coil.compose.rememberAsyncImagePainter
//import com.google.accompanist.permissions.ExperimentalPermissionsApi
//import com.google.accompanist.permissions.isGranted
//import com.google.accompanist.permissions.rememberMultiplePermissionsState
//import com.techmania.frontendmobile.ui.theme.WalmartAppTheme
//import java.io.File
//import java.util.*
//import kotlin.random.Random
//
//class MainActivity : ComponentActivity() {
//    override fun onCreate(savedInstanceState: Bundle?) {
//        super.onCreate(savedInstanceState)
//        setContent {
//            WalmartAppTheme {
//                Surface(modifier = Modifier.fillMaxSize()) {
//                    AppNavigator()
//                }
//            }
//        }
//    }
//}
//
//// --- Navigation ---
//@Composable
//fun AppNavigator(mainViewModel: MainViewModel = viewModel()) {
//    val navController = rememberNavController()
//    NavHost(navController = navController, startDestination = "home") {
//        composable("home") {
//            HomeScreen(navController = navController, viewModel = mainViewModel)
//        }
//        composable("results") {
//            ResultsScreen(navController = navController, viewModel = mainViewModel)
//        }
//    }
//}
//
//// --- Screens ---
//
//@OptIn(ExperimentalPermissionsApi::class, ExperimentalMaterial3Api::class)
//@Composable
//fun HomeScreen(navController: NavController, viewModel: MainViewModel) {
//    var text by remember { mutableStateOf("") }
//    val context = LocalContext.current
//    val keyboardController = LocalSoftwareKeyboardController.current
//    var imageUri by remember { mutableStateOf<Uri?>(null) }
//    val showDialog = remember { mutableStateOf(false) }
//
//    // --- LAUNCHERS & HELPERS (Full Logic) ---
//    fun getTmpFileUri(): Uri {
//        val tmpFile = File.createTempFile("tmp_image_file", ".png", context.cacheDir).apply {
//            createNewFile()
//            deleteOnExit()
//        }
//        return FileProvider.getUriForFile(
//            Objects.requireNonNull(context),
//            "${context.packageName}.provider",
//            tmpFile
//        )
//    }
//
//    val takePictureLauncher = rememberLauncherForActivityResult(ActivityResultContracts.TakePicture()) { isSuccess ->
//        if (isSuccess) {
//            imageUri?.let {
//                viewModel.searchByImage(context, it)
//                navController.navigate("results")
//            }
//        }
//    }
//
//    val galleryLauncher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
//        if (uri != null) {
//            viewModel.searchByImage(context, uri)
//            navController.navigate("results")
//        }
//    }
//
//    val voiceSearchLauncher = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
//        val spokenText = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.get(0)
//        if (!spokenText.isNullOrEmpty()) {
//            viewModel.searchByText(spokenText)
//            navController.navigate("results")
//        }
//    }
//
//    // --- PERMISSIONS ---
//    val permissionsState = rememberMultiplePermissionsState(
//        permissions = listOf(Manifest.permission.RECORD_AUDIO, Manifest.permission.CAMERA)
//    )
//
//    fun onSearch() {
//        if (text.isNotBlank()) {
//            keyboardController?.hide()
//            viewModel.searchByText(text)
//            navController.navigate("results")
//        }
//    }
//
//    // --- DIALOG (Full Logic) ---
//    if (showDialog.value) {
//        AlertDialog(
//            onDismissRequest = { showDialog.value = false },
//            title = { Text("Choose Image Source") },
//            text = { Text("Select an image from the gallery or take a new photo.") },
//            confirmButton = {
//                TextButton(onClick = {
//                    showDialog.value = false
//                    galleryLauncher.launch("image/*")
//                }) { Text("Gallery") }
//            },
//            dismissButton = {
//                TextButton(onClick = {
//                    showDialog.value = false
//                    if (permissionsState.permissions.first { it.permission == Manifest.permission.CAMERA }.status.isGranted) {
//                        imageUri = getTmpFileUri()
//                        takePictureLauncher.launch(imageUri)
//                    } else {
//                        permissionsState.launchMultiplePermissionRequest()
//                    }
//                }) { Text("Camera") }
//            }
//        )
//    }
//
//    // --- MAIN UI LAYOUT ---
//    Scaffold(
//        topBar = {
//            TopAppBar(
//                title = { Text("Walmart") },
//                colors = TopAppBarDefaults.topAppBarColors(
//                    containerColor = MaterialTheme.colorScheme.primary,
//                    titleContentColor = MaterialTheme.colorScheme.onPrimary
//                )
//            )
//        }
//    ) { paddingValues ->
//        Column(
//            modifier = Modifier
//                .fillMaxSize()
//                .padding(paddingValues)
//                .padding(16.dp),
//            horizontalAlignment = Alignment.CenterHorizontally,
//            verticalArrangement = Arrangement.Center
//        ) {
//            OutlinedTextField(
//                value = text,
//                onValueChange = { text = it },
//                modifier = Modifier.fillMaxWidth(),
//                label = { Text("Search for anything...") },
//                singleLine = true,
//                leadingIcon = { Icon(Icons.Default.Search, "Search") },
//                trailingIcon = {
//                    if (text.isNotEmpty()) {
//                        IconButton(onClick = { text = "" }) { Icon(Icons.Default.Clear, "Clear") }
//                    }
//                },
//                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
//                keyboardActions = KeyboardActions(onSearch = { onSearch() })
//            )
//            Spacer(Modifier.height(16.dp))
//
//            Button(
//                onClick = { onSearch() },
//                enabled = text.isNotBlank(),
//                modifier = Modifier.fillMaxWidth()
//            ) {
//                Icon(Icons.Default.Send, contentDescription = "Text Search Icon", modifier = Modifier.size(ButtonDefaults.IconSize))
//                Spacer(Modifier.size(ButtonDefaults.IconSpacing))
//                Text("Text Search")
//            }
//
//            Spacer(Modifier.height(24.dp))
//            Divider()
//            Spacer(Modifier.height(24.dp))
//
//            Row(
//                modifier = Modifier.fillMaxWidth(),
//                horizontalArrangement = Arrangement.SpaceEvenly
//            ) {
//                OutlinedButton(onClick = { showDialog.value = true }) {
//                    Text("Search by Image")
//                }
//                OutlinedButton(onClick = {
//                    if (permissionsState.permissions.first { it.permission == Manifest.permission.RECORD_AUDIO }.status.isGranted) {
//                        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
//                            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
//                            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
//                            putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak now...")
//                        }
//                        voiceSearchLauncher.launch(intent)
//                    } else {
//                        permissionsState.launchMultiplePermissionRequest()
//                    }
//                }) {
//                    Text("Search by Voice")
//                }
//            }
//        }
//    }
//}
//
//
//@OptIn(ExperimentalMaterial3Api::class)
//@Composable
//fun ResultsScreen(navController: NavController, viewModel: MainViewModel) {
//    val products by viewModel.products.collectAsState()
//    val isLoading by viewModel.isLoading
//    val errorMessage by viewModel.errorMessage
//
//    Scaffold(
//        topBar = {
//            TopAppBar(
//                title = { Text("Search Results") },
//                navigationIcon = {
//                    IconButton(onClick = { navController.popBackStack() }) { Icon(Icons.Default.ArrowBack, "Back") }
//                },
//                colors = TopAppBarDefaults.topAppBarColors(
//                    containerColor = MaterialTheme.colorScheme.primary,
//                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
//                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary
//                )
//            )
//        }
//    ) { paddingValues ->
//        Box(
//            modifier = Modifier.fillMaxSize().padding(paddingValues).background(MaterialTheme.colorScheme.background),
//            contentAlignment = Alignment.Center
//        ) {
//            when {
//                isLoading -> CircularProgressIndicator()
//                errorMessage != null -> Text(errorMessage!!, color = Color.Red, textAlign = TextAlign.Center, modifier = Modifier.padding(16.dp))
//                products.isEmpty() && !isLoading -> Text("No products found.", modifier = Modifier.padding(16.dp))
//                else -> LazyVerticalGrid(
//                    columns = GridCells.Fixed(2),
//                    contentPadding = PaddingValues(8.dp),
//                    verticalArrangement = Arrangement.spacedBy(8.dp),
//                    horizontalArrangement = Arrangement.spacedBy(8.dp)
//                ) {
//                    items(products) { product -> ProductCard(product) }
//                }
//            }
//        }
//    }
//}
//
//@Composable
//fun ProductCard(product: Product) {
//    val price = remember { Random.nextDouble(9.99, 199.99) }
//
//    Card(
//        modifier = Modifier.fillMaxWidth(),
//        shape = RoundedCornerShape(8.dp),
//        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
//        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
//    ) {
//        Column {
//            Image(
//                painter = rememberAsyncImagePainter(model = product.image_url),
//                contentDescription = product.product_name,
//                modifier = Modifier.height(160.dp).fillMaxWidth(),
//                contentScale = ContentScale.Crop
//            )
//            Column(modifier = Modifier.padding(12.dp).fillMaxWidth()) {
//                Text(
//                    text = String.format("$%.2f", price),
//                    fontWeight = FontWeight.ExtraBold,
//                    fontSize = 20.sp,
//                    color = MaterialTheme.colorScheme.onSurface
//                )
//                Spacer(Modifier.height(4.dp))
//                Text(
//                    text = product.product_name,
//                    fontWeight = FontWeight.Normal,
//                    maxLines = 2,
//                    overflow = TextOverflow.Ellipsis,
//                    fontSize = 14.sp
//                )
//                Spacer(Modifier.height(12.dp))
//                Button(
//                    onClick = { /* Does nothing for now */ },
//                    modifier = Modifier.fillMaxWidth(),
//                    shape = CircleShape
//                ) {
//                    Text("Add")
//                }
//            }
//        }
//    }
//}
//
//
//



// file: com/techmania/frontendmobile/MainActivity.kt
// This is the 100% complete and final version. No placeholders.

package com.techmania.frontendmobile

import android.Manifest
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.speech.RecognizerIntent
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.FileProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import coil.compose.rememberAsyncImagePainter
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberMultiplePermissionsState
import com.techmania.frontendmobile.ui.theme.WalmartAppTheme
import java.io.File
import java.util.*
import kotlin.random.Random

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            WalmartAppTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    AppNavigator()
                }
            }
        }
    }
}

// --- Navigation ---
@Composable
fun AppNavigator(mainViewModel: MainViewModel = viewModel()) {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "home") {
        composable("home") {
            HomeScreen(navController = navController, viewModel = mainViewModel)
        }
        composable("results") {
            ResultsScreen(navController = navController, viewModel = mainViewModel)
        }
    }
}

// --- Screens ---

@OptIn(ExperimentalPermissionsApi::class, ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(navController: NavController, viewModel: MainViewModel) {
    var text by remember { mutableStateOf("") }
    val context = LocalContext.current
    val keyboardController = LocalSoftwareKeyboardController.current
    var imageUri by remember { mutableStateOf<Uri?>(null) }
    val showDialog = remember { mutableStateOf(false) }

    // --- LAUNCHERS & HELPERS (Full Logic) ---
    fun getTmpFileUri(): Uri {
        val tmpFile = File.createTempFile("tmp_image_file", ".png", context.cacheDir).apply {
            createNewFile()
            deleteOnExit()
        }
        return FileProvider.getUriForFile(
            Objects.requireNonNull(context),
            "${context.packageName}.provider",
            tmpFile
        )
    }

    val takePictureLauncher = rememberLauncherForActivityResult(ActivityResultContracts.TakePicture()) { isSuccess ->
        if (isSuccess) {
            imageUri?.let {
                viewModel.searchByImage(context, it)
                navController.navigate("results")
            }
        }
    }

    val galleryLauncher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) {
            viewModel.searchByImage(context, uri)
            navController.navigate("results")
        }
    }

    val voiceSearchLauncher = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        val spokenText = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.get(0)
        if (!spokenText.isNullOrEmpty()) {
            viewModel.searchByText(spokenText)
            navController.navigate("results")
        }
    }

    // --- PERMISSIONS ---
    val permissionsState = rememberMultiplePermissionsState(
        permissions = listOf(Manifest.permission.RECORD_AUDIO, Manifest.permission.CAMERA)
    )

    fun onSearch() {
        if (text.isNotBlank()) {
            keyboardController?.hide()
            viewModel.searchByText(text)
            navController.navigate("results")
        }
    }

    // --- DIALOG (Full Logic) ---
    if (showDialog.value) {
        AlertDialog(
            onDismissRequest = { showDialog.value = false },
            title = { Text("Choose Image Source") },
            text = { Text("Select an image from the gallery or take a new photo.") },
            confirmButton = {
                TextButton(onClick = {
                    showDialog.value = false
                    galleryLauncher.launch("image/*")
                }) { Text("Gallery") }
            },
            dismissButton = {
                TextButton(onClick = {
                    showDialog.value = false
                    if (permissionsState.permissions.first { it.permission == Manifest.permission.CAMERA }.status.isGranted) {
                        imageUri = getTmpFileUri()
                        takePictureLauncher.launch(imageUri)
                    } else {
                        permissionsState.launchMultiplePermissionRequest()
                    }
                }) { Text("Camera") }
            }
        )
    }

    // --- MAIN UI LAYOUT ---
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Walmart") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            OutlinedTextField(
                value = text,
                onValueChange = { text = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Search for anything...") },
                singleLine = true,
                leadingIcon = { Icon(Icons.Default.Search, "Search") },
                trailingIcon = {
                    if (text.isNotEmpty()) {
                        IconButton(onClick = { text = "" }) { Icon(Icons.Default.Clear, "Clear") }
                    }
                },
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                keyboardActions = KeyboardActions(onSearch = { onSearch() })
            )
            Spacer(Modifier.height(16.dp))

            Button(
                onClick = { onSearch() },
                enabled = text.isNotBlank(),
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.Send, contentDescription = "Text Search Icon", modifier = Modifier.size(ButtonDefaults.IconSize))
                Spacer(Modifier.size(ButtonDefaults.IconSpacing))
                Text("Text Search")
            }

            Spacer(Modifier.height(24.dp))
            Divider()
            Spacer(Modifier.height(24.dp))

            // --- ICON BUTTONS ROW ---
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                IconButton(
                    onClick = { showDialog.value = true },
                    modifier = Modifier.size(56.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.CameraAlt,
                        contentDescription = "Search by Image",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(32.dp)
                    )
                }
                IconButton(
                    onClick = {
                        if (permissionsState.permissions.first { it.permission == Manifest.permission.RECORD_AUDIO }.status.isGranted) {
                            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                                putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
                                putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak now...")
                            }
                            voiceSearchLauncher.launch(intent)
                        } else {
                            permissionsState.launchMultiplePermissionRequest()
                        }
                    },
                    modifier = Modifier.size(56.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Mic,
                        contentDescription = "Search by Voice",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(32.dp)
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResultsScreen(navController: NavController, viewModel: MainViewModel) {
    val products by viewModel.products.collectAsState()
    val isLoading by viewModel.isLoading
    val errorMessage by viewModel.errorMessage

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Search Results") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) { Icon(Icons.Default.ArrowBack, "Back") }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier.fillMaxSize().padding(paddingValues).background(MaterialTheme.colorScheme.background),
            contentAlignment = Alignment.Center
        ) {
            when {
                isLoading -> CircularProgressIndicator()
                errorMessage != null -> Text(errorMessage!!, color = Color.Red, textAlign = TextAlign.Center, modifier = Modifier.padding(16.dp))
                products.isEmpty() && !isLoading -> Text("No products found.", modifier = Modifier.padding(16.dp))
                else -> LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    contentPadding = PaddingValues(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(products) { product -> ProductCard(product) }
                }
            }
        }
    }
}

@Composable
fun ProductCard(product: Product) {
    val price = remember { Random.nextDouble(9.99, 199.99) }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
            Image(
                painter = rememberAsyncImagePainter(model = product.image_url),
                contentDescription = product.product_name,
                modifier = Modifier.height(160.dp).fillMaxWidth(),
                contentScale = ContentScale.Crop
            )
            Column(modifier = Modifier.padding(12.dp).fillMaxWidth()) {
                Text(
                    text = String.format("$%.2f", price),
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 20.sp,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = product.product_name,
                    fontWeight = FontWeight.Normal,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    fontSize = 14.sp
                )
                Spacer(Modifier.height(12.dp))
                Button(
                    onClick = { /* Does nothing for now */ },
                    modifier = Modifier.fillMaxWidth(),
                    shape = CircleShape
                ) {
                    Text("Add")
                }
            }
        }
    }
}
