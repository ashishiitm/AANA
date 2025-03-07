#!/bin/bash

# Activate the virtual environment
source /Users/ashish/AANA/myenv/bin/activate

# Navigate to the project directory
cd /Users/ashish/AANA/project/backend

# Export the path to PostgreSQL libs if needed
export DYLD_LIBRARY_PATH=/usr/local/opt/libpq/lib:$DYLD_LIBRARY_PATH

# Run the server with detailed output
python manage.py runserver 