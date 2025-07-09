// file: com/techmania/frontendmobile/ProductRepository.kt
package com.techmania.frontendmobile

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.io.IOException

class ProductRepository(private val context: Context) {

    // A private list to hold all our products once they are loaded
    private var allProducts: List<Product> = emptyList()

    init {
        // Load the products as soon as the repository is created
        allProducts = loadProductsFromAssets()
    }

    private fun loadProductsFromAssets(): List<Product> {
        val jsonString: String
        try {
            // Open the products.json file from the assets folder
            jsonString = context.assets.open("products.json").bufferedReader().use { it.readText() }
        } catch (ioException: IOException) {
            // If the file can't be read, print an error and return an empty list
            ioException.printStackTrace()
            return emptyList()
        }

        // Use Gson to convert the JSON string into a list of Product objects
        val listProductType = object : TypeToken<List<Product>>() {}.type
        return Gson().fromJson(jsonString, listProductType)
    }

    // This is our new, local search function!
    fun searchProducts(query: String): List<Product> {
        // If the search query is empty, return an empty list
        if (query.isBlank()) {
            return emptyList()
        }

        // Filter the 'allProducts' list
        return allProducts.filter { product ->
            // Check if the product's name or description contains the search query (ignoring case)
            product.product_name.contains(query, ignoreCase = true) ||
                    product.description.contains(query, ignoreCase = true)
        }
    }
}