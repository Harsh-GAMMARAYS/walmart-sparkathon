from PIL import Image
# try:
from .text_to_image import text_to_image_search
from .image_to_image import image_to_image_search
# except:
#     from text_to_image import text_to_image_search
#     from image_to_image import image_to_image_search

from datasets import load_dataset

from langchain_core.vectorstores import InMemoryVectorStore
# Initialize with an embedding model
from langchain_huggingface import HuggingFaceEmbeddings
import json

from  langchain_core.documents import Document
from tqdm import tqdm
from pprint import pprint
import re

class Retriever:
    def __init__(self, model_name: str = "sentence-transformers/all-mpnet-base-v2"):
        self.model_name = model_name
        self.vector_store = None
        self.embedding_model = HuggingFaceEmbeddings(
            model_name=self.model_name,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": False},
        )

    def load_dataset_to_vectordb(self, dataset_id: str = "ivanleomk/ecommerce-items", save_path: str = "data/walmart_dataset_index"):
        """Loads dataset, converts to Documents, and saves vector store"""
        print("🔄 Loading dataset...")
        dataset = load_dataset(dataset_id, cache_dir="data/wallmart_dataset")
        train_data = dataset['train']

        def extract_data(row):
            data = dict(row)
            data.pop('image')
            return data

        docs = []
        for i in tqdm(range(len(train_data))):
            data_row = extract_data(train_data[i])
            metadata = {"image": train_data[i]['image']}  # Image metadata (not embedded)
            text = json.dumps(data_row)
            doc = Document(page_content=text, metadata=metadata)
            docs.append(doc)

        print("✨ Embedding and indexing documents...")
        vector_store = InMemoryVectorStore(embedding=self.embedding_model)
        vector_store.add_documents(documents=docs, ids=[f"item_{i}" for i in range(len(docs))])
        vector_store.dump(path=save_path)
        print(f"✅ Vector store saved to {save_path}")
        
        
    def load_json_to_vectordb(self, json_path: str = "data/ecommerce-items.json", save_path: str = "data/json_db_index"):
        """Loads json, converts to Documents, and saves vector store"""
        print("🔄 Loading dataset...")
        
        
        with open(json_path , 'r') as fp:
            dataset = json.load(fp)
        

        def extract_data(row):
            data = dict(row)
            data.pop('image')
            return data

        docs = []
        for i in tqdm(range(len(dataset))):
            data_row = extract_data(dataset[i])
            metadata = {"image": dataset[i]['image']}  # Image metadata (not embedded)
            text = json.dumps(data_row)
            doc = Document(page_content=text, metadata=metadata)
            docs.append(doc)

        print("✨ Embedding and indexing documents...")
        vector_store = InMemoryVectorStore(embedding=self.embedding_model)
        vector_store.add_documents(documents=docs, ids=[f"item_{i}" for i in tqdm(range(len(docs)))])
        print("Saving the vecctor store")
        vector_store.dump(path=save_path)
        self.vector_store = vector_store
        print(f"✅ Vector store saved to {save_path}")
        
        

    def load_vectordb(self, path: str = "data/walmart_dataset_index"):
        """Load previously saved vector store"""
        print(f"📦 Loading vector store from {path}...")
        self.vector_store = InMemoryVectorStore.load(path=path, embedding=self.embedding_model)
        print("✅ Vector store loaded.")

    def query(self, query_text: str, k: int = 5):
        """Run similarity search"""
        if not self.vector_store:
            raise ValueError("❌ Vector store not loaded. Call `load_vectordb()` first.")
        
        print(f"🔍 Searching for: {query_text}")
        results = self.vector_store.similarity_search(query=query_text, k=k)
        return results




class imageSearcher:
    def __init__(self):
        self.clothAnalyzer = image_to_image_search.ClothAnalyzer()
        
        self.retriever = Retriever()
        
        self.retriever.load_vectordb(path="data/json_db_index")
        
        self.text_to_image_llm = text_to_image_search.LLM()
        
    def parseResults(self ,results):
        parsed_results = []
        for result in results:
            parsed = {}
            parsed["image"]  = result.metadata['image']
            parsed["item"]  = result.page_content
            parsed_results.append(parsed)    
        return parsed_results
    
    def extract_json(self , text):
        match = re.search(r"```(.*?)```", text, re.DOTALL)
        if match:
            json_str = match.group(1).strip()
            try:
                # Step 2: Parse the extracted string as JSON
                parsed_data = json.loads(json_str)
                print(parsed_data[0])
            except json.JSONDecodeError as e:
                print("Failed to decode JSON:", e)
        else:
            print("No JSON block found.")
        return parsed_data[0]
    
    
    
    def searchFromImage(self , image_path):


        image = Image.open(image_path)
        
        result = self.clothAnalyzer.analyze(image)

        print("🧵 Cloth Description:", result)  
        results = self.retriever.query(query_text=result)
        parsed_results = self.parseResults(results=results)
        
        search_results = []
        
        for parsed_result in parsed_results:
            
            llm_prompt = self.clothAnalyzer.get_image_prompt(parsed_results = parsed_result)
            
            
            search_result = self.text_to_image_llm.get_response(prompt=llm_prompt)
            search_result = self.extract_json(search_result)
            search_results.append(search_result)
            
        pprint(search_results)
        
        # extract the results from the llm response and 
        # to that add the item data brands etc etc    
        
        return {"agent_output":{"llm_output":search_results , "raw_output":parsed_results}}
    
    def searchFromText(self , query:str , k :int = 3):


        
        results = self.retriever.query(query_text=query , k=k)
        parsed_results = self.parseResults(results=results)
        
        
        search_results = []
        
        for parsed_result in parsed_results:
            
            llm_prompt = self.clothAnalyzer.get_image_prompt(parsed_results = parsed_result)
            
            
            search_result = self.text_to_image_llm.get_response(prompt=llm_prompt)
            search_result = self.extract_json(text = search_result)
            search_results.append(search_result)
            
        pprint(search_results)
        
        # extract the results from the llm response and 
        # to that add the item data brands etc etc    
        
        return {"agent_output":{"llm_output":search_results , "raw_output":parsed_results}}
    
    
    
    
    
    
if __name__ == "__main__":
    
    # retriever = Retriever()
    
    # retriever.load_vectordb(path="data/json_db_index")
    
    # print(retriever.query("tel me abot the black clothes from jessica london" , k = 1))
    
    
    # searcher = imageSearcher()
    
    # print(searcher.searchFromText(query="tell me about the black clothes from jessica london" , k = 1))

    text = '''Based on the provided data, I\'ve parsed the result and extracted the relevant information. Here\'s the output in the requested JSON format:\n\n```\n[\n  {\n    "image": "https://i5.walmartimages.com/seo/TheLovely-Women-Plus-Relaxed-Fit-Long-Sleeve-Round-Neck-Hem-Jersey-Tee-Shirt-Top_456ad015-506d-40ac-bfa8-c2d875c06dfd.02dc524061e756eaa067fc22681f7db5.jpeg",\n    "description": "TheLovely Women\'s Relaxed Fit Long Sleeve Round Neck Jersey Tee Shirt Top, made from incredibly soft 57% polyester, 38% rayon, and 5% spandex material. Available in solid pattern and various sizes."\n  }\n]\n```'''

    # Step 1: Extract the content inside triple backticks
    