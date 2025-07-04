 manodeepray

`/query`


```json

{
    'query_type' : 'image' 
    'content':{
                'image': None or image
                }
    'uid': char
    'action':imagesearch (only)

}

```



```json

{
    'query_type' : 'text'
    'content':{
                'text_query': None or str
                }
    'uid': char
    'action':None -> 'imagesearch' or 'agent'  <- decided by llm

}

```










# imagesearch

if  `query_type = image` then `action = imagesearch`   automatically

api `query/imageSearch`

Steps:
- i/p -> image  ;

- retrieve top k items;

- 0/p -> images(urls) + text

output ->

``` json
{
    'search_output':[
                    {'image_url': "https://image1.com",    'image_desc':"brief description" , 'item_data':"categories , brands .etc"  },,

                    {'image_url': "https://image2.com",  
                      'image_desc':"black etc etc"} , 
                    'item_data':"categories , brands .etc" },
                    
                    {'image_url': "https://image3.com",  
                      'image_desc':"black etc etc"} ,
                     'item_data':"categories , brands .etc" },
                    ],


}

```




---


if  `query_type = text` and `action = imagesearch`   

api `query/textSearch`

Steps:
- i/p -> text  ;

- retrieve top k items;

- 0/p -> images(urls) + text

output ->

``` json
{
    'search_output':[
                    {'image_url': "https://image1.com",    'image_desc':"brief description" , 'item_data':"categories , brands .etc"  },,

                    {'image_url': "https://image2.com",  
                      'image_desc':"black etc etc"} , 
                    'item_data':"categories , brands .etc" },
                    
                    {'image_url': "https://image3.com",  
                      'image_desc':"black etc etc"} ,
                     'item_data':"categories , brands .etc" },
                    ],


}

```





# agent

if `query_type = text` and `action = agent`

Parse the old json to new json

API endpoint : `query/agent`



>middle ware output - new Json

```json

{
    'query_type' : 'text'
    'content':{
                'text_query': None or str
                }
    'uid': char
    'action':'agent'
    'agent':'database' or 'history' or 'websearch'  <- decided by llm

}

```



i/p text_query': None or str -> llm -> decide tool -> tool


## 1. database agent

API endpoint : `query/agent/databaseAgent`

i/p text_query' +  datbase tool -> database call -> database items-> llm -> parsed content -> 0/p

Agent Prompt:
db schema  , framework(mongodb) +  uid + natural language query -llm-> code for database query


## 2. history agent

API endpoint : `query/agent/historyAgent`

i/p text_query' + history tool -> history database call -> history items-> llm -> parsed content -> o/p


## 3. Web Search agent

API endpoint : `query/agent/webSearchAgent`

i/p text_query' + wesearch tool -> light websearch from walmart website -> search items-> llm -> parsed content -> o/p


```json

{
    'agent_output':{
                'llm_output' : str
                'raw_output' : list or dict or str
                },      

}

```