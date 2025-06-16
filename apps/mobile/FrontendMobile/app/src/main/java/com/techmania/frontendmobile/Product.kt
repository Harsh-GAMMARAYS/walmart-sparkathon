// file: com/techmania/frontendmobile/Product.kt
package com.techmania.frontendmobile

//// This class holds the data for a single product.
data class Product(
    val id: Int,
    val product_name: String,
    val description: String,
    val image_url: String
)

// This class will hold the entire list of products from the API response.
data class SearchResponse(
    val results: List<Product>
)


