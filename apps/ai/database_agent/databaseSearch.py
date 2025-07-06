from pymongo import MongoClient
from dotenv import load_dotenv
import os
import re

load_dotenv(dotenv_path="./.env")


class DatabaseSearcher:
    def __init__(self, llm , db_name="dataset1", collection_name="e-commerce-database"):
        # Load env variables
        load_dotenv()
        password = os.getenv("MONGO_DB_PASSKEY")

        # Connect to MongoDB Atlas
        uri = f"mongodb+srv://manodeepray:{password}@cluster0.ht5shpm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
        self.client = MongoClient(uri)
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
        
        
        prompt = f"""
        You are a helpful assistant. A user searched for products, and here are the database results:

        {results}

        Summarize the above list in a clear, concise way, highlighting key product features, brand names, categories, and prices. Use bullet points or a numbered list. Avoid repeating similar items unnecessarily.
            """

        response = self.llm.get_response(prompt=prompt)

        return response.strip()

    def search(self, natural_query: str, limit: int = 10):
        
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
    