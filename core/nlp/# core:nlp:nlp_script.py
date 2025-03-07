# core/nlp/nlp_script.py
import sys
import json
from shared_model import SharedModel

if len(sys.argv) != 2:
    print(json.dumps({"error": "No query provided"}))
    sys.exit(1)

query = sys.argv[1]
model = SharedModel.get_model()

try:
    response = model.create_completion(
        prompt=query,
        max_tokens=100,
        temperature=0.7,
        top_p=0.9,
    )
    text_response = response['choices'][0]['text'].strip()
    
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
    
    print(json.dumps({
        "conditions": conditions,
        "location": location,
        "disease": disease,
        "eligibility": eligibility
    }))
except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)