#!/bin/bash

# Activate virtual environment
source /Users/ashish/AANA/myenv/bin/activate

# Navigate to the backend directory
cd /Users/ashish/AANA/project/backend

# Run the email test script
python test_email.py

# Print completion message
echo "Email test completed." 