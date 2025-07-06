from groq import Groq
from dotenv import load_dotenv
import os



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