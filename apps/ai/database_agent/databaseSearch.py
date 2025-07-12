from pymongo import MongoClient
from dotenv import load_dotenv
import os
import re
import sys
import json
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv(dotenv_path="./.env")

class DatabaseSearcher:
    def __init__(self, llm , db_name="WalmartDB", collection_name="products"):
        # Load env variables
        load_dotenv()
        # password = os.getenv("MONGO_DB_PASSKEY")

        # Connect to MongoDB Atlas
        uri = os.getenv("MONGODB_URI");
        if not uri:
            raise ValueError("MONGODB_URI environment variable not set!")
        self.client = MongoClient(uri, tls=True)
        self.db = self.client[db_name]
        self.collection = self.db[collection_name]

        self.llm = llm

        # Save schema description
        self.schema_description = {
        "title": "string",
        "category": "string",
        "subcategory": "string",
        "brand": "string",
        "description": "string",
        "image": "list of strings (image URLs)",
        "price": "float"
    }


    def _generate_mongo_filter(self, natural_query: str) -> dict:
        """Use the LLM to convert a natural language query into a MongoDB filter."""
        
        
        example = {
                    "subcategory": { "$regex": "dresses", "$options": "i" },
                    "brand": { "$regex": "kawell", "$options": "i" },
                    "price": { "$lte": 20 }
                }
        prompt = f"""
                You are an expert MongoDB assistant. Your task is to convert a user's natural language product search query into an accurate MongoDB filter dictionary.

                ### User Query:
                {natural_query}

                ### 📦 MongoDB Document Schema (Use this as reference only — do not add extra fields):
                Each document in the collection strictly follows this structure:
                - `title` (string): e.g., "LOL Dress for Toddler Girl Elegant Mesh Dress"
                - `category` (string): e.g., "Clothing"
                - `subcategory` (string): e.g., "Dresses"
                - `brand` (string): e.g., "KAWELL"
                - `description` (string): free-text content
                - `image` (list of strings): image URLs
                - `price` (float): e.g., 9.89

                ###  Instructions:
                - Output a valid **Python dictionary** that can be passed directly to `collection.find()`
                - Use **only the fields defined in the schema above**
                - Use **case-insensitive `$regex`** for matching string fields like `title`, `category`, `subcategory`, `brand`, and `description`
                - Use **numeric operators** such as `$lte` / `$gte` for price-based filtering (e.g., "under ₹1000" → `"price": "$lte": 1000 `)
                - If the query mentions product names or features, match them using `$regex` on `title` and/or `description`
                - Do **not** include any explanation, markdown, or comments — respond with a clean, valid Python dictionary only

                ### Output Format Example:
                ```python
                {example}

        Respond only with a dictionary like the one above.
        """

        response = self.llm.get_response(prompt = prompt)
        
        
        
        
#         response = """```python
# {'$or': [{'title': {'$regex': 'hnm|bags', '$options': 'i'}}, {'description': {'$regex': 'hnm|bags', '$options': 'i'}}, {'brand': {'$regex': 'hnm', '$options': 'i'}}]}
# ```"""
        mongo_filter = response.strip()
        mongo_filter = mongo_filter.replace("python","")
        mongo_filter = mongo_filter.replace("```" , "")
        
        
        
        
        print(mongo_filter)
        try:
            return eval(mongo_filter)
        except Exception as e:
            print("⚠️ Failed to parse MongoDB filter:", e)
            print("LLM Output:", mongo_filter)
            return {}
        
        
        
    def summarizer(self , results):
        if not results:
            return "I couldn't find any products matching your search. Try a different search term?"
            
        # Return structured product data for the frontend to render as cards
        products_data = []
        for item in results:
            product_id = item.get('_id', '')
            title = item.get('title', 'Unknown Product')
            price = item.get('price', 0)
            brand = item.get('brand', 'Unknown Brand')
            description = item.get('description', '')
            images = item.get('image', [])
            
            # Get first image for thumbnail
            thumbnail = images[0] if images and len(images) > 0 else 'https://via.placeholder.com/200x200?text=No+Image'
            
            product_data = {
                'id': product_id,
                'title': title,
                'brand': brand,
                'price': price,
                'description': description[:100] + '...' if len(description) > 100 else description,
                'thumbnail': thumbnail,
                'link': f"http://localhost:3000/products/{product_id}"
            }
            products_data.append(product_data)
        
        # Create response with special marker for product cards
        if len(results) == 1:
            intro = "I found this product for you:"
        else:
            intro = f"I found {len(results)} great options for you:"
            
        # Use special markers that the frontend will detect
        response = f"{intro}\n\n[PRODUCT_CARDS_START]{json.dumps(products_data)}[PRODUCT_CARDS_END]\n\nYou can click any product to view details, or ask me about specific items!"
        
        return response

    def search(self, natural_query: str, limit: int = 5):
        
        agent_response = {
                            'agent_output':{
                                        "llm_output" : None,
                                        "raw_output" : None
                                        },      
                            }
        
        
        
        """Performs semantic query -> MongoDB filter -> DB search."""
        mongo_filter = self._generate_mongo_filter(natural_query)
        print("🔎 MongoDB Filter:", mongo_filter)

        results = list(self.collection.find(mongo_filter).limit(limit))
        # Convert ObjectId to string for each result
        for item in results:
            if '_id' in item:
                item['_id'] = str(item['_id'])
        if results:
            print(f"\n✅ Found {len(results)} matching item(s):")
            for item in results:
                title = item.get("title", "No title")
                price = item.get("price", "No price")
                print(f"- {title} | ₹{price}")
        else:
            print("❌ No matching items found.")
        
        
        
        agent_response["agent_output"]["raw_output"] = results
        agent_response["agent_output"]["llm_output"] = self.summarizer(results=results)
        
        
        return agent_response

if __name__ == "__main__":
    # schema = {
    #     "title": "string",
    #     "category": "string",
    #     "subcategory": "string",
    #     "brand": "string",
    #     "description": "string",
    #     "image": "list of strings (image URLs)",
    #     "price": "float"
    # }

    # searcher = DatabaseSearcher(db_name="dataset1", collection_name="e-commerce-database")

    # query = "Show me cartoon dresses for toddler girls under ₹20"
    # searcher.search(query)



    response = """```python
{'$or': [{'title': {'$regex': 'hnm|bags', '$options': 'i'}}, {'description': {'$regex': 'hnm|bags', '$options': 'i'}}, {'brand': {'$regex': 'hnm', '$options': 'i'}}]}
```"""
    mongo_filter = response.strip()
    mongo_filter = mongo_filter.replace("python","")
    mongo_filter = mongo_filter.replace("```" , "")
    print(eval(mongo_filter))
    
