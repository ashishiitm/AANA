#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Clinical Trials Search Platform...${NC}"

# Check if Python virtual environment exists
if [ ! -d "myenv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv myenv
fi

# Activate virtual environment and start backend
echo -e "${GREEN}Starting Django backend server...${NC}"
cd project/backend
source ../../myenv/bin/activate
python manage.py runserver 8000 &
BACKEND_PID=$!
cd ../..

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to start...${NC}"
sleep 5

# Start frontend
echo -e "${GREEN}Starting React frontend...${NC}"
cd project/frontend
npm start &
FRONTEND_PID=$!
cd ../..

# Function to handle script termination
cleanup() {
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit 0
}

# Set up trap to catch termination signals
trap cleanup SIGINT SIGTERM

echo -e "${GREEN}Both servers are running!${NC}"
echo -e "${YELLOW}Backend: http://localhost:8000${NC}"
echo -e "${YELLOW}Frontend: http://localhost:3000${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Keep script running
wait 