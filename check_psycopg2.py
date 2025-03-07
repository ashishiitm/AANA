#!/usr/bin/env python
import sys

print(f"Python version: {sys.version}")
print(f"Python executable: {sys.executable}")

try:
    import psycopg2
    print(f"psycopg2 is installed. Version: {psycopg2.__version__}")
except ImportError as e:
    print(f"Error importing psycopg2: {e}")
    
    try:
        import psycopg
        print(f"psycopg is installed. Version: {psycopg.__version__}")
    except ImportError as e:
        print(f"Error importing psycopg: {e}")
        
print("\nPython path:")
for path in sys.path:
    print(f"  {path}") 