#!/bin/bash
cd /Users/ashish/AANA
source /Users/ashish/AANA/myenv/bin/activate
pip install requests
python test_api.py > api_test_results.txt 2>&1
echo "API test completed. Results saved to api_test_results.txt" 