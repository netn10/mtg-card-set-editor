#!/bin/bash

echo "Starting MTG Custom Set Editor..."

echo ""
echo "Starting Flask Backend..."
cd backend
python app.py &
BACKEND_PID=$!

echo ""
echo "Waiting for backend to start..."
sleep 3

echo ""
echo "Starting React Frontend..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "Both servers are starting up..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for background processes
wait
