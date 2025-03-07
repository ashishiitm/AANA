#!/bin/bash

echo "=== API Diagnostic Script ==="
echo "This script will help diagnose and fix issues with the API"

# Check if servers are running
echo "1. Checking running servers..."
ps aux | grep runserver

# Kill any running Django servers
echo "2. Stopping any running Django servers..."
pkill -f runserver

# Check frontend API configuration
echo "3. Examining frontend API configuration..."
cat /Users/ashish/AANA/project/frontend/src/api.js

# Check backend URLs
echo "4. Examining backend URL configuration..."
if [ -f "/Users/ashish/AANA/project/urls.py" ]; then
  cat /Users/ashish/AANA/project/urls.py
elif [ -f "/Users/ashish/AANA/urls.py" ]; then
  cat /Users/ashish/AANA/urls.py
fi

# Check core views
echo "5. Examining core views..."
if [ -d "/Users/ashish/AANA/core" ]; then
  if [ -f "/Users/ashish/AANA/core/views.py" ]; then
    cat /Users/ashish/AANA/core/views.py
  fi
fi

# Start servers
echo "6. Starting servers again..."
echo "Starting backend server on port 8000..."
cd /Users/ashish/AANA && python manage.py runserver &

echo "7. Starting frontend server..."
cd /Users/ashish/AANA/project/frontend && yarn start &

echo "=== Script completed ==="
echo "Please check the console output for any errors" 