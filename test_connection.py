import os
import sys

# Try different PostgreSQL adapters
adapters = []

try:
    import psycopg
    adapters.append(("psycopg3", psycopg))
    print("Successfully imported psycopg (v3)")
except ImportError as e:
    print(f"Error importing psycopg (v3): {e}")

try:
    import psycopg2
    adapters.append(("psycopg2", psycopg2))
    print("Successfully imported psycopg2")
except ImportError as e:
    print(f"Error importing psycopg2: {e}")

if not adapters:
    print("No PostgreSQL adapters found. Please install psycopg or psycopg2.")
    sys.exit(1)

# Test connection with each adapter
for name, adapter in adapters:
    print(f"\nTesting connection with {name}...")
    try:
        print(f"Adapter module path: {adapter.__file__}")
        
        if name == "psycopg3":
            # psycopg (v3)
            conn = adapter.connect(
                dbname="trialmatch",
                user="ashish",
                password="aana",
                host="localhost",
                port="5432"
            )
        else:
            # psycopg2
            conn = adapter.connect(
                dbname="trialmatch",
                user="ashish",
                password="aana",
                host="localhost",
                port="5432"
            )
            
        print(f"Connection successful with {name}!")
        
        # Show connection info
        if name == "psycopg3":
            print(f"Server version: {conn.info.server_version}")
        else:
            print(f"Server version: {conn.server_version}")
            
        # Test executing a simple query
        with conn.cursor() as cur:
            cur.execute("SELECT current_timestamp")
            timestamp = cur.fetchone()[0]
            print(f"Current timestamp from DB: {timestamp}")
            
        conn.close()
        print(f"{name} connection test completed successfully")
    except Exception as e:
        print(f"Error connecting with {name}: {e}")
        
print("\nConnection test completed.") 