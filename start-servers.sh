#!/bin/bash

echo "=== Starting Clinical Trials Application ==="

# Kill any existing servers
echo "Stopping any running servers..."
pkill -f runserver || true
pkill -f "node.*start" || true

# Start the Django backend server
echo "Starting Django backend server..."
cd /Users/ashish/AANA/project/backend
source venv/bin/activate
python manage.py migrate  # Run migrations first
python manage.py runserver &
BACKEND_PID=$!
echo "Backend server started with PID: $BACKEND_PID"

# Wait a moment for the backend to initialize
echo "Waiting for backend to initialize..."
sleep 2

# Start the frontend server
echo "Starting React frontend server..."
cd /Users/ashish/AANA/project/frontend
yarn start &
FRONTEND_PID=$!
echo "Frontend server started with PID: $FRONTEND_PID"

echo ""
echo "=== Servers are now running ==="
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Trap sigint and kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Keep script running
wait 