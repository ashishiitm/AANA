#!/usr/bin/env python
import sys
import os

# Add the project path to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'project'))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'project/backend'))

# Try to import psycopg2
try:
    import psycopg2
    print(f"psycopg2 version: {psycopg2.__version__}")
except ImportError as e:
    print(f"Error importing psycopg2: {e}")
    print("Trying to import psycopg...")
    try:
        import psycopg
        print(f"psycopg version: {psycopg.__version__}")
    except ImportError as e:
        print(f"Error importing psycopg: {e}")

# Try to connect to PostgreSQL
try:
    # Try to import Django settings
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.backend.core.settings')
        from django.conf import settings
        db_settings = settings.DATABASES['default']
        print("Database settings from Django:")
        print(f"  ENGINE: {db_settings.get('ENGINE')}")
        print(f"  NAME: {db_settings.get('NAME')}")
        print(f"  USER: {db_settings.get('USER')}")
        print(f"  HOST: {db_settings.get('HOST')}")
        print(f"  PORT: {db_settings.get('PORT')}")
        
        # Try to connect using Django's connection
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        print(f"Connected to PostgreSQL using Django: {version}")
        cursor.close()
    except Exception as e:
        print(f"Error getting Django settings: {e}")
        
    # Try direct connection
    print("\nTrying direct connection to PostgreSQL...")
    conn = psycopg2.connect(
        dbname="trialmatch",
        user="ashish",
        password="aana",
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    version = cursor.fetchone()[0]
    print(f"Connected to PostgreSQL directly: {version}")
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error connecting to PostgreSQL: {e}")

print("\nChecking PostgreSQL installation:")
try:
    import subprocess
    result = subprocess.run(['which', 'psql'], capture_output=True, text=True)
    if result.stdout:
        print(f"PostgreSQL client found at: {result.stdout.strip()}")
        version_result = subprocess.run(['psql', '--version'], capture_output=True, text=True)
        print(f"PostgreSQL client version: {version_result.stdout.strip()}")
    else:
        print("PostgreSQL client not found in PATH")
except Exception as e:
    print(f"Error checking PostgreSQL installation: {e}") 