from fastapi.responses import JSONResponse 
from fastapi import FastAPI , UploadFile  , File
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from item_search_agent import imageSearch
import AgentSupervisor
from fastapi.responses import HTMLResponse
import markdown
from pydantic import BaseModel
from  typing import Optional , Literal , Dict , Union , List
import shutil

# ----------- INPUT dataclasses---------------#

class imageInput(BaseModel):
    image : Optional[str]
    

class textInput(BaseModel):
    text_query : Optional[str]
    
class jsonInput(BaseModel):
    query_type: Literal["image" , "text"]
    content: Union[imageInput , textInput]
    uid : str
    action : Optional[Literal["imagesearch" , "toolagent"]]
    context: Optional[List[Dict]] = None
    user: Optional[Dict] = None
    browsingContext: Optional[Dict] = None
    

# ----------- OUTPUT dataclasses---------------#

    
class AgentOutput(BaseModel):
    llm_output: str
    raw_output: Union[str, List, Dict]
    
    
class AgentResponse(BaseModel):
    agent_output: AgentOutput

    

    
#----- initializing the agent and image search model --------


print("========  initializing the server components ===========")

try:
    llmInstance= AgentSupervisor.LLM()


    supervisor = AgentSupervisor.SupervisorAgent(llmInstance)
    print("========  Agent Supervisor initialized ===========")
except Exception as e:
    print(f"ERROR initializing the supervisor  agent : {e}")
try:
    searcher = imageSearch.imageSearcher()
    print("========  image searcher initialized ===========")
except Exception as e:
    print(f"ERROR initializing the image searcher : {e}")
    import traceback
    traceback.print_exc()
    searcher = None  # Set to None if initialization fails




#----------- server endpoints ------------------------
app =  FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.api_route(path="/", methods=["GET"])
async def home():
   
    
    return {"test":"successful"}



@app.api_route(path="/ai", methods=["GET"])
async def ai_server_startup():
    with open("README.md", "r") as f:
        md_content = f.read()
    html_content = markdown.markdown(md_content)
    
    
    return HTMLResponse(content=html_content)



@app.api_route(path="/ai/imageSearch" , methods=["POST"])
async def searchFromImage(image : UploadFile = File(...)):
    
    """Takes in imagesearch json and saves the image in buffer , 
    runs the image search model to find similar items 

    Args:
        image_json (jsonInput): _description_

    Returns:
        _type_: _description_
    """
    
    
    #save image in buffer
    
    buffer_path = f"buffer/{image.filename}"
    
    try:
        with open(buffer_path, "wb") as buffer_file:
            shutil.copyfileobj(image.file, buffer_file)

        print (JSONResponse(status_code=200, content={"message": "Image received and saved", "filename": image.filename}))
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})  
    
    
    try:
        #loadimage from buffer to search and output search results
        if searcher is None:
            return JSONResponse(status_code=500, content={"error": "Image searcher not initialized. Check server startup logs."})
        
        search_output = searcher.searchFromImage(image_path=buffer_path)
        return search_output
    
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    
    
@app.api_route(path="/ai/agentQuery" , methods=["POST"])
async def agentQuery(query_json: jsonInput) -> Dict:
    query_json = query_json.model_dump()
    try:
        # Check if supervisor is initialized
        if supervisor is None:
            return JSONResponse(status_code=500, content={"error": "Agent supervisor not initialized. Check server startup logs."})
        
        #getting response from supervisor
        supervisor_response = supervisor.get_agent_response(query_json = query_json)
        
        return {"agent_output": supervisor_response}
    except Exception as e:
        import traceback
        print(f"ERROR in agentQuery: {e}")
        print(traceback.format_exc())
        return JSONResponse(status_code=500 , content={"error":str(e)})