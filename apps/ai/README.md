
# `/query` API

This is the main query endpoint. Based on `query_type` and `action`, it delegates the request to image search or agent modules.

---

## 🧾 Request Schemas

### 🔹 1. Image Query

```json
{
  "query_type": "image",
  "content": {
    "image": null  // or base64/image blob
  },
  "uid": "char",
  "action": "imagesearch"
}
```

* `action` must always be `"imagesearch"` for image-based queries.

---

### 🔹 2. Text Query

```json
{
  "query_type": "text",
  "content": {
    "text_query": "string or null"
  },
  "uid": "char",
  "action": null  // or "imagesearch" or "agent" (decided by LLM)
}
```

* `action` is determined dynamically by an LLM based on the content.

---

# 🔍 Image Search

## 1. If `query_type = image` and `action = imagesearch`

**Endpoint:** `query/imageSearch`

**Flow:**

* Input: image
* Operation: retrieve top-k items based on similarity
* Output: images with descriptions and metadata

### ✅ Response:

```json
{
  "search_output": [
    {
      "image_url": "https://image1.com",
      "image_desc": "brief description",
      "item_data": "categories, brands, etc."
    },
    {
      "image_url": "https://image2.com",
      "image_desc": "black etc etc",
      "item_data": "categories, brands, etc."
    },
    {
      "image_url": "https://image3.com",
      "image_desc": "black etc etc",
      "item_data": "categories, brands, etc."
    }
  ]
}
```

---

## 2. If `query_type = text` and `action = imagesearch`

**Endpoint:** `query/textSearch`

**Flow:**

* Input: text
* Operation: perform text-based semantic search
* Output: top-k image results with metadata

### ✅ Response:

(Same as image-based search)

```json
{
  "search_output": [
    {
      "image_url": "https://image1.com",
      "image_desc": "brief description",
      "item_data": "categories, brands, etc."
    },
    {
      "image_url": "https://image2.com",
      "image_desc": "black etc etc",
      "item_data": "categories, brands, etc."
    },
    {
      "image_url": "https://image3.com",
      "image_desc": "black etc etc",
      "item_data": "categories, brands, etc."
    }
  ]
}
```

---

# 🧠 Agent (LLM-Driven)

## If `query_type = text` and `action = agent`

**Middleware parses input and adds `agent` field:**

### 🔁 Transformed Input

```json
{
  "query_type": "text",
  "content": {
    "text_query": "string or null"
  },
  "uid": "char",
  "action": "agent",
  "agent": "database" | "history" | "websearch"  // decided by LLM
}
```

---

## 🧩 Agent Endpoints

### 1. `database` Agent

**Endpoint:** `query/agent/databaseAgent`

* Input: `text_query`
* Operation: LLM converts text → database query using MongoDB schema → executes query → LLM parses output

---

### 2. `history` Agent

**Endpoint:** `query/agent/historyAgent`

* Input: `text_query`
* Operation: LLM queries historical data → parses and formats output

---

### 3. `websearch` Agent

**Endpoint:** `query/agent/webSearchAgent`

* Input: `text_query`
* Operation: LLM performs light web search (e.g., Walmart) → retrieves relevant items → parses and summarizes results

---

## ✅ Agent Response Format

```json
{
  "agent_output": {
    "llm_output": "summary or explanation",
    "raw_output": "raw data (list, dict, or string)"
  }
}
```

---

Let me know if you'd like this in a downloadable `README.md` format or integrated into an OpenAPI schema!
