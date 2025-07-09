# query = text_query

# query -> itemsearch / agent 
# if itemSearch -> retrieve items

# if agent
#     agent -> choose agent ->web / simple llm / history / database


from groq import Groq
from dotenv import load_dotenv
import os
try:
    from .web_search_agent import webSearch
    from .database_agent import databaseSearch
except:
    from web_search_agent import webSearch
    from database_agent import databaseSearch
    
from pprint import pprint




import json



load_dotenv(dotenv_path="./.env")




class LLM:
    """ the LLM bridge that acts as the controlling agent throughout the project
    """
    def __init__(self) -> None:
        self.GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

        self.llm  = Groq(
                    api_key=self.GROQ_API_KEY,
                    )
        self.response_count : int = 0

        self.response_limit : int = 100




    def get_response(self  , prompt : str , ) -> str:

        if self.response_count <= self.response_limit:

            response  = self.llm.chat.completions.create(
                        messages=[
                            {
                                "role": "user",
                                "content": f"{prompt}",
                            }
                        ],
                        model="llama-3.3-70b-versatile",
                    )

            self.response_count += 1

        else : response = "rate limit exceedee"


        return response.choices[0].message.content

class SupervisorAgent:
    """
    The SupervisorAgent class decides which downstream agent (itemsearch or toolagent)
    should handle a given user query. It leverages an LLM to make this decision
    based on specific criteria.
    """
    def __init__(self, llm_instance: LLM):
        """
        Initializes the SupervisorAgent with an LLM instance.

        Args:
            llm_instance: An instance of a class that provides a getresponse(prompt) method.
                          This is expected to be your LLM integration.
        """
        self.llm = llm_instance
        # Define the specific prompt structure for the LLM's decision-making
        
        # self.image_searcher = imageSearch.imageSearcher()
        self.websearcher = webSearch.WebSearcher(llm = self.llm)
        self.databasesearcher = databaseSearch.DatabaseSearcher(llm = self.llm)
        
        self.decision_prompt_template = """
                                You are a decision-making assistant. Your job is to classify a user query as either:

                                - 'simplellm': The query can be handled by a simple language model (e.g., general knowledge retrieval.).
                                - 'toolagent': The query requires broader capabilities like web search, user history access, or database search (eg , product lookup, structured search, category/brand/price-related queries))

                                Rules:
                                - If the query is about general reasoning → set 'simplellm': true
                                - If the query requires a product (e.g., brand, size, price, description, features) or a structured product search , user data, recommendations, or web access → set 'toolagent': true
                                - If the query is unclear or broad, default to 'toolagent': true
                                Respond **only** with a JSON object:
                                - Example for product search:     {{"simplellm": true, "toolagent": false}}
                                - Example for general purpose:    {{"simplellm": false, "toolagent": true}}

                                Now classify the following query:

                                User Query: "{user_query}"
"""



    def decide_agent(self, query: str) -> dict:
        """
        Decides whether to use 'itemsearch' or 'toolagent' based on the query.

        Args:
            query: The user's natural language query string.

        Returns:
            A dictionary containing the decision, e.g., {'itemsearch': True, 'toolagent': False}.
            Returns an error dictionary if parsing fails.
        """
        # Format the prompt with the user's query
        prompt = self.decision_prompt_template.format(user_query=query)

        print(f"DEBUG: Sending prompt to LLM:\n---\n{prompt}\n---")

        # Get response from the LLM
        llm_raw_response = self.llm.get_response(prompt=prompt)

        print(f"DEBUG: Raw LLM response: {llm_raw_response}")

        # Parse the JSON response
        try:
            decision = json.loads(llm_raw_response)
            # Basic validation to ensure the expected keys are present and are booleans
            if isinstance(decision, dict) and \
               'simplellm' in decision and isinstance(decision['simplellm'], bool) and \
               'toolagent' in decision and isinstance(decision['toolagent'], bool):
                return decision
            else:
                print("WARNING: LLM response format unexpected. Defaulting to toolagent.")
                return {"simplellm": False, "toolagent": True}
        except json.JSONDecodeError as e:
            print(f"ERROR: Failed to parse LLM response as JSON: {e}")
            print(f"Raw response was: {llm_raw_response}")
            # Fallback in case of parsing error
            return {"simplellm": False, "toolagent": True}




    # def decide_tool_agent(self, query: str) -> dict:
    #     """
    #     If the initial decision is 'toolagent', this function further decides which
    #     specific tool agent (websearcher, history_searcher, simple_llm, database_searcher)
    #     should handle the query.

    #     Args:
    #         query: The user's natural language query string.

    #     Returns:
    #         A dictionary containing the decision for the specific tool agent,
    #         e.g., {'websearcher': True, 'history_searcher': False, ...}.
    #         Returns an error dictionary if parsing fails.
    #     """
    #     # Format the prompt with the user's query
    #     prompt = self.tool_agent_decision_prompt_template.format(user_query=query)

    #     print(f"DEBUG: Sending tool agent decision prompt to LLM:\n---\n{prompt}\n---")

    #     # Get response from the LLM
    #     llm_raw_response = self.llm.get_response(prompt=prompt)

    #     print(f"DEBUG: Raw LLM response for tool agent decision: {llm_raw_response}")

    #     # Parse the JSON response
    #     try:
    #         decision = json.loads(llm_raw_response)
    #         # Basic validation for the tool agent decision
    #         expected_keys = ["websearcher", "history_searcher", "simple_llm", "database_searcher"]
    #         if isinstance(decision, dict) and all(key in decision and isinstance(decision[key], bool) for key in expected_keys):
    #             # Ensure only one is true
    #             if sum(decision.values()) == 1:
    #                 return decision
    #             else:
    #                 print("WARNING: LLM response for tool agent decision has more/less than one 'true' value. Defaulting to simple_llm.")
    #                 return {"websearcher": False, "history_searcher": False, "simple_llm": True, "database_searcher": False}
    #         else:
    #             print("WARNING: LLM response for tool agent decision format unexpected. Defaulting to simple_llm.")
    #             return {"websearcher": False, "history_searcher": False, "simple_llm": True, "database_searcher": False}
    #     except json.JSONDecodeError as e:
    #         print(f"ERROR: Failed to parse LLM response for tool agent decision as JSON: {e}")
    #         print(f"Raw response was: {llm_raw_response}")
    #         # Fallback in case of parsing error
    #         return {"websearcher": False, "history_searcher": False, "simple_llm": True, "database_searcher": False}

    
    
    
    
    
    
    
    
    def format_agent_outputs(self, agent_llm_outputs: dict):
        """
        Takes the agent_llm_outputs dictionary and creates a section-wise natural language explanation.
        """
        prompt = f"""
                    You are a helpful assistant. You are given the outputs from multiple agents in a dictionary format like this:

                    {agent_llm_outputs}

                    Each key represents a specific agent's response:
                    - "search_agent_output": output from a tool that performs external or semantic search
                    - "history_agent_output": output based on user history or past interactions
                    - "database_agent_output": output from a MongoDB-based product lookup

                    Your task is to generate a **section-wise summary** in natural language that clearly and cleanly explains each part. For each section:
                    - Use a clear heading (like "🔍 Search Agent Output")
                    - If the value is `None`, say the agent did not return any useful information.
                    - Otherwise, summarize or rewrite the response into a concise and readable format.

                    Make the response structured, easy to read, and human-friendly.

                    Generate the final response below:
        """
        response = self.llm.get_response(prompt=prompt)
        return response.strip()

    
    
    
    
    
    
    
    
    
    
    
    def run_agents_loop(self , query_json :dict) -> dict:
        
        query = query_json['content']['text_query']
        
        agent_output = {
                            'agent_output':{
                                        "llm_output" : None,
                                        "raw_output" : None
                                        },      
                            }
    
        print("  -> Agents loop (further decision needed)")
        # Now, if it's a toolagent, make the sub-decision
        
        agent_raw_outputs = {
            "search_agent_output":None,
            "history_agent_output":None,
            "database_agent_output":None
                             }
        
        agent_llm_outputs = {
            "search_agent_output":None,
            "history_agent_output":None,
            "database_agent_output":None
                             }
            
        # --- Web Searcher ---
        try:
            print("    -> Route to WebSearcher")
            search_agent_output = self.websearcher.get_search_results(query=query)
            agent_raw_outputs["search_agent_output"] = search_agent_output["agent_output"]["raw_output"]
            agent_llm_outputs["search_agent_output"] = search_agent_output["agent_output"]["llm_output"]
        except Exception as e:
            print(f"[Error] WebSearcher failed: {e}")
            agent_raw_outputs["search_agent_output"] = None
            agent_llm_outputs["search_agent_output"] = None

        # --- History Searcher ---
        try:
            print("    -> Route to HistorySearcher")
            # Assuming placeholder or default output here
            history_agent_output = {
                "agent_output": {
                    "llm_output": "None",
                    "raw_output": "None"
                }
            }
            agent_raw_outputs["history_agent_output"] = history_agent_output["agent_output"]["raw_output"]
            agent_llm_outputs["history_agent_output"] = history_agent_output["agent_output"]["llm_output"]
        except Exception as e:
            print(f"[Error] HistorySearcher failed: {e}")
            agent_raw_outputs["history_agent_output"] = None
            agent_llm_outputs["history_agent_output"] = None

        # --- Database Searcher ---
        try:
            print("    -> Route to Database Searcher")
            database_agent_output = self.databasesearcher.search(natural_query=query)
            agent_raw_outputs["database_agent_output"] = database_agent_output["agent_output"]["raw_output"]
            agent_llm_outputs["database_agent_output"] = database_agent_output["agent_output"]["llm_output"]
        except Exception as e:
            print(f"[Error] DatabaseSearcher failed: {e}")
            agent_raw_outputs["database_agent_output"] = None
            agent_llm_outputs["database_agent_output"] = None

                
        agent_output["agent_output"]["raw_output"] = agent_raw_outputs
        agent_output["agent_output"]["llm_output"] = agent_llm_outputs
        
        
        
        
        
        
        
    
        return agent_output
    
    
    


    
    
    
    def get_agent_response(self , query_json):
        query = query_json['content']['text_query']
        
        
        supervisor_response = {
            "llm_output":None,
            "raw_output":None,
            "action" : None
        }
        
        
        
        print(f"\nUser Query: \"{query}\"")
        decision_result = self.decide_agent(query = query)
        
        
        
        print(f"Decision: {decision_result}")
        
        
        if decision_result.get("simplellm"):
            print("  -> Route to simplellm ")
            action = "simplellm"
            response = self.llm.get_response(prompt=query)
            
            
            supervisor_response["llm_output"] = response
            supervisor_response["action"] = action
            
            
            
            
        elif decision_result.get("toolagent"):
            print("  -> Route to Tool Agent")
            action = "toolagent"
            agent_output = self.run_agents_loop(query_json=query_json)





            supervisor_response["llm_output"] = self.format_agent_outputs(agent_output["agent_output"]["llm_output"])
            supervisor_response["raw_output"] = agent_output["agent_output"]["raw_output"]
            supervisor_response["action"] = action


            
        else:
            print("  -> Decision unclear or both false, defaulting to Tool Agent.") # Should not happen with current prompt/mock
            action = None
            

       
        
        return supervisor_response
    
    
# --- Example Usage ---
if __name__ == "__main__":
    
    query_json = {
    'query_type' : 'text',
    'content':{
                'text_query': "I need a blue t-shirt, size large."
                },
    'uid': "1234",
    'action':None#'imagesearch' or 'agent'  <- decided by llm
    }
    # 1. Instantiate your LLM (using MockLLM for this example)
    my_llm = LLM()

    # 2. Instantiate the SupervisorAgent
    supervisor = SupervisorAgent(my_llm)

    supervisor_response = supervisor.get_agent_response(query_json = query_json)
    
    pprint(supervisor_response)

    # print("--- Initial Agent Decision Tests ---")
    # initial_queries = [
    #     "What is the brand of the new running shoes?",          # Should be itemsearch
    #     "How much does the iPhone 15 Pro Max cost?",            # Should be itemsearch
    #     "Search Walmart for cheap laptops.",                    # Should be toolagent
    #     "What is the capital of France?",                       # Should be toolagent
    #     "Show me user history for my last three orders.",       # Should be toolagent
    #     "I need a blue t-shirt, size large.",                   # Should be itemsearch
    #     "Tell me about quantum physics."                        # Should be toolagent
    # ]

    # for q in initial_queries:
    #     print(f"\nUser Query: \"{q}\"")
    #     decision_result = supervisor.decide_agent(q)
    #     print(f"Initial Decision: {decision_result}")
    #     if decision_result.get("itemsearch"):
    #         print("  -> Route to ItemSearch Agent")
    #     elif decision_result.get("toolagent"):
    #         print("  -> Route to Tool Agent (further decision needed)")
    #         # Now, if it's a toolagent, make the sub-decision
    #         tool_decision = supervisor.decide_tool_agent(q)
    #         print(f"  Tool Agent Sub-Decision: {tool_decision}")
    #         if tool_decision.get("websearcher"):
    #             print("    -> Route to WebSearcher")
    #         elif tool_decision.get("history_searcher"):
    #             print("    -> Route to HistorySearcher")
    #         elif tool_decision.get("simple_llm"):
    #             print("    -> Route to Simple LLM")
    #         elif tool_decision.get("database_searcher"):
    #             print("    -> Route to Database Searcher")
    #         else:
    #             print("    -> No specific tool agent decided.")

    # print("\n--- Direct Tool Agent Decision Tests (for demonstration) ---")
    # tool_agent_queries = [
    #     "Search the internet for the latest stock prices.",
    #     "What was my order from last month?",
    #     "Can you explain recursion to me?",
    #     "Lookup customer account number for email: example@email.com",
    #     "Find reviews for the new movie on the Walmart website.", # Should hit websearcher
    #     "What is the current temperature in London?",
    #     "What's in my shopping cart history?",
    #     "Get me the employee details for ID 5678."
    # ]

    # for q in tool_agent_queries:
    #     print(f"\nUser Query (Tool Agent Focus): \"{q}\"")
    #     tool_decision_result = supervisor.decide_tool_agent(q)
    #     print(f"Tool Agent Decision: {tool_decision_result}")
    #     if tool_decision_result.get("websearcher"):
    #         print("  -> Route to WebSearcher")
    #     elif tool_decision_result.get("history_searcher"):
    #         print("  -> Route to HistorySearcher")
    #     elif tool_decision_result.get("simple_llm"):
    #         print("  -> Route to Simple LLM")
    #     elif tool_decision_result.get("database_searcher"):
    #         print("  -> Route to Database Searcher")
    #     else:
    #         print("  -> No specific tool agent decided.")

