# core/nlp/nlp_api.py
import sys
sys.path.append('/Users/ashish/AANA/myenv/lib/python3.10/site-packages/')
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from shared_model import SharedModel
import json

app = FastAPI()

class NLPQuery(BaseModel):
    query: str

@app.post("/process")
async def process_nlp(query: NLPQuery):
    try:
        # Get the LLaMA model
        model = SharedModel.get_model()
        
        # Process the natural language query
        response = model.create_completion(
            prompt=query.query,
            max_tokens=100,  # Adjust as needed
            temperature=0.7,  # Adjust for creativity
            top_p=0.9,       # Adjust for response diversity
        )
        
        # Extract parameters from the response (simplified example)
        text_response = response['choices'][0]['text'].strip()
        
        # Simple parsing logic (you'll need to refine this based on your needs)
        conditions = None
        location = None
        disease = None
        eligibility = None
        
        if "cancer" in text_response.lower():
            disease = "Cancer"
        if "new york" in text_response.lower():
            location = "New York"
        if "adults" in text_response.lower():
            eligibility = "Adults only"
        if "diabetes" in text_response.lower():
            disease = "Diabetes"
        
        return {
            "conditions": conditions,
            "location": location,
            "disease": disease,
            "eligibility": eligibility
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)