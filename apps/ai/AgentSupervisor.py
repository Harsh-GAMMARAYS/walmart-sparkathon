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

    
    
    
    
    
    
    
    
    def format_agent_outputs(self, agent_llm_outputs: dict, user_name: str = None):
        """
        Takes the agent_llm_outputs dictionary and creates a natural, customer-friendly response.
        """
        greeting = f"Hello {user_name}! " if user_name else "Hello! "
        
        prompt = f"""
                    You are a helpful Walmart shopping assistant. Based on the search results below, provide a natural, conversational response to the customer.

                    Search Results: {agent_llm_outputs}

                    Rules:
                    - Write as if you're a friendly store associate helping a customer
                    - NEVER mention "Database Agent Output", "Search Agent Output", or any technical terms
                    - Just give the product information naturally
                    - If products were found, present them in a helpful way
                    - Keep it conversational and customer-focused
                    - If multiple products are available, present them as options
                    - Start with a friendly greeting if appropriate

                    Write a natural response:
        """
        response = self.llm.get_response(prompt=prompt)
        return response.strip()
        
    def handle_product_details(self, query: str, products: list, user_name: str = None) -> str:
        """
        Handle follow-up questions about specific products from previous search results.
        """
        greeting = f"Hello {user_name}! " if user_name else ""
        
        prompt = f"""
        You are a helpful Walmart shopping assistant. A customer is asking about specific products from a previous search.

        Customer's question: "{query}"
        
        Available products from previous search:
        {json.dumps(products, indent=2)}

        Rules:
        - Answer the customer's specific question about the products
        - If they ask about a specific product (by name, brand, or position), provide detailed info
        - Include product links when relevant: http://localhost:3000/products/[product_id]
        - Be helpful and conversational
        - If they ask about price, size, description, etc., provide that info
        - Use the customer's name if provided: {user_name}
        
        Provide a helpful response:
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
        context = query_json.get('context', [])
        user_info = query_json.get('user', {})
        user_name = user_info.get('name') if user_info else None
        is_guest = user_info is None or user_info == {}
        browsing_context = query_json.get('browsingContext', {})
        
        # Extract browsing context information
        search_history = browsing_context.get('searchHistory', [])
        viewed_products = browsing_context.get('viewedProducts', [])
        cart_items = browsing_context.get('cartItems', [])
        cart_total = browsing_context.get('cartTotal', 0)
        
        supervisor_response = {
            "llm_output":None,
            "raw_output":None,
            "action" : None
        }
        
        # Check if this is a greeting or first interaction
        is_greeting = any(word in query.lower() for word in ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'])
        
        # Check if this is a follow-up question about products from context
        previous_products = None
        if context and len(context) > 0:
            # Look for previous assistant messages that might contain product data
            for msg in reversed(context):
                if msg.get('role') == 'assistant' and 'View Product:' in msg.get('content', ''):
                    # This suggests we previously showed products
                    previous_products = "found_in_context"  # Flag that we have product context
                    break
        
        # Enhanced query with browsing context
        enhanced_query_parts = [f"Customer query: {query}"]
        
        # Add browsing context information
        if search_history:
            enhanced_query_parts.append(f"Recent searches: {', '.join(search_history[:3])}")
        
        if viewed_products:
            enhanced_query_parts.append(f"Recently viewed {len(viewed_products)} products")
        
        if cart_items:
            cart_summary = f"Cart: {len(cart_items)} items, total: ${cart_total:.2f}"
            if len(cart_items) <= 3:
                cart_details = ", ".join([f"{item.get('title', 'Unknown')} (${item.get('price', 0):.2f})" for item in cart_items])
                cart_summary += f" - {cart_details}"
            enhanced_query_parts.append(cart_summary)
        
        # Add context to query if available
        if context and len(context) > 0:
            context_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in context[-3:]])  # Last 3 messages
            enhanced_query_parts.append(f"Previous conversation:\n{context_str}")
        
        decision_query = "\n".join(enhanced_query_parts)
        
        print(f"\nUser Query with Browsing Context: \"{decision_query}\"")
            
        decision_result = self.decide_agent(query = decision_query)
        
        
        
        print(f"Decision: {decision_result}")
        
        
        if decision_result.get("simplellm"):
            print("  -> Route to simplellm ")
            action = "simplellm"
            
            # Enhanced prompt for simple LLM with user and browsing context
            enhanced_prompt = f"""
            You are a helpful Walmart shopping assistant. 
            {"Customer name: " + user_name if user_name else "Customer: Guest user"}
            
            Customer query: {query}
            
            Browsing Context:
            {"- Recent searches: " + ", ".join(search_history[:3]) if search_history else ""}
            {"- Recently viewed " + str(len(viewed_products)) + " products" if viewed_products else ""}
            {"- Cart: " + str(len(cart_items)) + " items, total $" + str(cart_total) + "" if cart_items else ""}
            
            Rules:
            - Be friendly and conversational
            - {"Address the customer by name (" + user_name + ") when appropriate" if user_name else ""}
            - Use their browsing context to provide more relevant suggestions
            - If they have items in cart, you can reference them
            - If they've been searching for specific items, acknowledge their interests
            - Provide helpful information based on their shopping behavior
            - If it's a greeting, respond warmly and offer assistance
            - Keep responses focused on helping with shopping needs
            {"- Occasionally mention benefits of creating an account for better personalized experience" if is_guest else ""}
            
            Provide a helpful response:
            """
            
            response = self.llm.get_response(prompt=enhanced_prompt)
            
            supervisor_response["llm_output"] = response
            supervisor_response["action"] = action
            
            
            
            
        elif decision_result.get("toolagent"):
            print("  -> Route to Tool Agent")
            action = "toolagent"
            # Update query_json to include context-enhanced query for agents
            enhanced_query_json = query_json.copy()
            enhanced_query_json['content']['text_query'] = decision_query
            agent_output = self.run_agents_loop(query_json=enhanced_query_json)

            # Check if we have database results with products
            raw_output = agent_output["agent_output"]["raw_output"]
            llm_output = agent_output["agent_output"]["llm_output"]
            database_results = raw_output.get("database_agent_output") if raw_output else None
            
            if database_results and len(database_results) > 0:
                # We have product results - use the clean database response directly
                clean_response = llm_output.get("database_agent_output", "")
                
                # Add personalized greeting with browsing context
                if user_name and (is_greeting or len(context) == 0):
                    greeting = f"Hello {user_name}! "
                    if search_history:
                        greeting += f"I see you've been searching for {search_history[0]}. "
                    clean_response = greeting + clean_response
                elif is_guest and (is_greeting or len(context) == 0):
                    greeting = "Hello! "
                    if search_history:
                        greeting += f"I see you've been searching for {search_history[0]}. "
                    clean_response = greeting + clean_response + "\n\n💡 Tip: Sign up for a Walmart account to get personalized recommendations, order history, and exclusive deals!"
                
                # Add browsing context hints for product searches
                if search_history and not is_greeting:
                    if any(search_term.lower() in query.lower() for search_term in search_history[:2]):
                        clean_response += f"\n\n🔍 Based on your recent searches, I found these related products for you!"
                
                # Add guest benefits message occasionally for product searches
                if is_guest and not is_greeting and len(context) > 2:
                    clean_response += "\n\n🔑 Want a better shopping experience? Create an account to save your preferences and get tailored recommendations!"
                
                supervisor_response["llm_output"] = clean_response
                supervisor_response["raw_output"] = {
                    "products": database_results,  # Store for follow-up questions
                    "last_search": query,
                    "action_type": "product_search",
                    "browsing_context": browsing_context
                }
            else:
                # Handle non-product responses (web search, general questions)
                formatted_response = self.format_agent_outputs(llm_output, user_name)
                
                # Add personalized greeting with browsing context
                if user_name and (is_greeting or len(context) == 0):
                    greeting = f"Hello {user_name}! "
                    if search_history:
                        greeting += f"I see you've been browsing for {search_history[0]}. "
                    formatted_response = greeting + formatted_response
                elif is_guest and (is_greeting or len(context) == 0):
                    greeting = "Hello! "
                    if search_history:
                        greeting += f"I see you've been browsing for {search_history[0]}. "
                    formatted_response = greeting + formatted_response + "\n\n💡 Tip: Sign up for a Walmart account to get personalized recommendations, order history, and exclusive deals!"
                
                supervisor_response["llm_output"] = formatted_response
                supervisor_response["raw_output"] = raw_output
            
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

