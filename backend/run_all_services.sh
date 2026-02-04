#!/bin/bash

# Run all microservices in development mode
# Each service runs on a different port

echo "Starting all microservices..."

# Store PIDs for cleanup
PIDS=()

cleanup() {
    echo "Stopping all services..."
    for pid in "${PIDS[@]}"; do
        kill $pid 2>/dev/null
    done
    exit 0
}

trap cleanup SIGINT SIGTERM

cd "$(dirname "$0")"

# Auth Service - Port 8001
echo "Starting Auth Service on port 8001..."
cd services/auth && python run.py &
PIDS+=($!)
cd ../..

# Products Service - Port 8002
echo "Starting Products Service on port 8002..."
cd services/products && python run.py &
PIDS+=($!)
cd ../..

# Categories Service - Port 8003
echo "Starting Categories Service on port 8003..."
cd services/categories && python run.py &
PIDS+=($!)
cd ../..

# Orders Service - Port 8004
echo "Starting Orders Service on port 8004..."
cd services/orders && python run.py &
PIDS+=($!)
cd ../..

# Inventory Service - Port 8005
echo "Starting Inventory Service on port 8005..."
cd services/inventory && python run.py &
PIDS+=($!)
cd ../..

# Search Service - Port 8006
echo "Starting Search Service on port 8006..."
cd services/search && python run.py &
PIDS+=($!)
cd ../..

echo ""
echo "All services started!"
echo "================================"
echo "Auth Service:       http://localhost:8001/docs"
echo "Products Service:   http://localhost:8002/docs"
echo "Categories Service: http://localhost:8003/docs"
echo "Orders Service:     http://localhost:8004/docs"
echo "Inventory Service:  http://localhost:8005/docs"
echo "Search Service:     http://localhost:8006/docs"
echo "================================"
echo "Press Ctrl+C to stop all services"

wait
