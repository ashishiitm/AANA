import requests
import json

def test_api_endpoint(url):
    print(f"Testing API endpoint: {url}")
    try:
        response = requests.get(url)
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print("Response data:")
                print(json.dumps(data, indent=2))
            except json.JSONDecodeError:
                print("Response is not valid JSON:")
                print(response.text[:500])  # Print first 500 characters
        else:
            print("Response text:")
            print(response.text[:500])  # Print first 500 characters
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Test the database stats endpoint
    test_api_endpoint("http://localhost:8000/api/stats/database/")
    
    # Test the active trials endpoint
    test_api_endpoint("http://localhost:8000/api/trials/active/")
    
    # Test the featured studies endpoint
    test_api_endpoint("http://localhost:8000/api/studies/featured/") 