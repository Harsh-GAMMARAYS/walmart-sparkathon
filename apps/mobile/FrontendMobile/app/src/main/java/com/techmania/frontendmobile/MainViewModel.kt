// file: com/techmania/frontendmobile/MainViewModel.kt
package com.techmania.frontendmobile

import android.content.Context
import android.net.Uri
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody

class MainViewModel : ViewModel() {

    // This will hold our list of products. The UI will "flow" from this.
    private val _products = MutableStateFlow<List<Product>>(emptyList())
    val products = _products.asStateFlow()

    // UI state for loading spinner and error messages
    val isLoading = mutableStateOf(false)
    val errorMessage = mutableStateOf<String?>(null)

    fun searchByText(query: String) {
        viewModelScope.launch {
            isLoading.value = true
            errorMessage.value = null
            try {
                val requestBody = query.toRequestBody("text/plain".toMediaTypeOrNull())
                val response = RetrofitInstance.api.searchByText(requestBody)
                _products.value = response.results
            } catch (e: Exception) {
                errorMessage.value = "Search failed: ${e.localizedMessage}"
                _products.value = emptyList()
            } finally {
                isLoading.value = false
            }
        }
    }

    fun searchByImage(context: Context, imageUri: Uri) {
        viewModelScope.launch {
            isLoading.value = true
            errorMessage.value = null
            try {
                // Read the image from the URI provided by the gallery/camera
                val imageBytes = context.contentResolver.openInputStream(imageUri)?.readBytes()
                if (imageBytes != null) {
                    val requestFile = imageBytes.toRequestBody("image/jpeg".toMediaTypeOrNull())
                    val body = MultipartBody.Part.createFormData("file", "image.jpg", requestFile)

                    val response = RetrofitInstance.api.searchByImage(body)
                    _products.value = response.results
                } else {
                    throw Exception("Could not read image file.")
                }
            } catch (e: Exception) {
                errorMessage.value = "Search failed: ${e.localizedMessage}"
                _products.value = emptyList()
            } finally {
                isLoading.value = false
            }
        }
    }
}
