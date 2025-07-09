// file: com/techmania/frontendmobile/ApiService.kt
package com.techmania.frontendmobile

import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.http.*

interface ApiService {
    @Multipart
    @POST("/search_image")
    suspend fun searchByImage(@Part image: MultipartBody.Part): SearchResponse

    @Multipart
    @POST("/search_text")
    suspend fun searchByText(@Part("query") query: RequestBody): SearchResponse
}