# background_search.py

import requests
import json
from typing import Dict
from dotenv import load_dotenv
import os

load_dotenv("./.env")






class WebSearcher:
    def __init__(self, llm,):
        self.llm = llm
        self.api_key = os.environ['TAVILY_API_KEY']
        self.search_url = "https://api.tavily.com/search"

    def query(self, query: str):
        payload = {
            "query": query,
            "topic": "general",
            "search_depth": "basic",
            "chunks_per_source": 3,
            "max_results": 1,
            "time_range": None,
            "days": 7,
            "include_answer": True,
            "include_raw_content": True,
            "include_images": False,
            "include_image_descriptions": False,
            "include_domains": [],
            "exclude_domains": [],
            "country": None
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        response = requests.post(self.search_url, json=payload, headers=headers)
        if not response.ok:
            raise Exception(f"API request failed: {response.status_code} - {response.text}")
        
        return json.loads(response.text)

    def generate_query(self, prompt: str) -> str:
        response = self.llm.get_response(prompt=prompt)
        return response.strip().split("Search query:")[-1].strip()

    def get_search_results(self, query : str) -> Dict[str, Dict[str , str]]:
        agent_response = {
                            'agent_output':{
                                        "llm_output" : None,
                                        "raw_output" : None
                                        },      
                            }

        
        
        
        
        
        query_prompt = f"""
        You are a search query generation assistant. Your task is to generate a short and precise web search query to learn more about the following user Query :

        Data: {query}

        Generate a web search query that would help a search engine find more about this item from walmart's page.
        Use the item name, description, or any other useful info.

        Output format:
        Search query: <query here>
        """
        search_query = self.generate_query(query_prompt)
        search_result = self.query(search_query)
        
        agent_response['agent_output']['raw_output'] = search_result.get("answer")

        parsed_prompt = f"""
        You are a search result summarizer. Your task is to generate a short  , point wise and descriptive summary  of web search result for user to read the retrieved search results easily :

        Data: {agent_response['agent_output']['raw_output']}

        Generate the response in .md format
        show all the items separately in ordered list
        Use the item name, description, or any other useful info.
        only return the summarized response
        
        
        Output format:
        summarized response: <summary here>
        """
        summarized_search_response = self.generate_query(parsed_prompt)

        
        agent_response['agent_output']['llm_output'] = summarized_search_response

        return agent_response


if __name__ == "__main__":
    
    
    pass