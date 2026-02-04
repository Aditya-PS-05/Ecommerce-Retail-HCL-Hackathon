import sys
import os

# Get the backend directory (two levels up from this file)
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
sys.path.insert(0, backend_dir)

# Also add current service directory
service_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, service_dir)

print(f"Python path: {sys.path}")
print(f"Backend dir: {backend_dir}")
print(f"Service dir: {service_dir}")

import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=False
    )
