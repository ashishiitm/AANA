import os
import sys
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from django.db import connection

# Try to import PostgreSQL adapters
psycopg_available = False
psycopg2_available = False

try:
    import psycopg
    psycopg_available = True
    print("psycopg (v3) is available")
except ImportError:
    print("psycopg (v3) is not available")

try:
    import psycopg2
    psycopg2_available = True
    print("psycopg2 is available")
except ImportError:
    print("psycopg2 is not available")

if not psycopg_available and not psycopg2_available:
    print("ERROR: Neither psycopg nor psycopg2 is available. Please install one of them.")
    sys.exit(1)

# Import models after Django setup
from core.models import Studies

def check_db_connection():
    print("\nChecking database connection...")
    print(f"Database settings: {settings.DATABASES['default']}")
    
    # Try direct connection with psycopg or psycopg2
    if psycopg_available:
        try:
            print("\nTesting direct connection with psycopg (v3)...")
            conn = psycopg.connect(
                dbname=settings.DATABASES['default']['NAME'],
                user=settings.DATABASES['default']['USER'],
                password=settings.DATABASES['default']['PASSWORD'],
                host=settings.DATABASES['default']['HOST'],
                port=settings.DATABASES['default']['PORT']
            )
            print("Direct connection with psycopg successful!")
            
            # Get PostgreSQL version
            with conn.cursor() as cursor:
                cursor.execute("SELECT version();")
                version = cursor.fetchone()[0]
                print(f"PostgreSQL version: {version}")
            
            # Check studies table
            with conn.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM studies;")
                count = cursor.fetchone()[0]
                print(f"Total studies in database (direct query): {count}")
                
                cursor.execute("SELECT COUNT(*) FROM studies WHERE overall_status = 'RECRUITING';")
                recruiting = cursor.fetchone()[0]
                print(f"Recruiting studies (direct query): {recruiting}")
                
                cursor.execute("SELECT COUNT(*) FROM studies WHERE overall_status = 'ACTIVE';")
                active = cursor.fetchone()[0]
                print(f"Active studies (direct query): {active}")
                
                cursor.execute("SELECT nct_id, official_title FROM studies WHERE overall_status = 'RECRUITING' LIMIT 5;")
                print("\nSample recruiting studies:")
                for row in cursor.fetchall():
                    print(f"- {row[0]}: {row[1]}")
            
            conn.close()
            
        except Exception as e:
            print(f"Error with direct psycopg connection: {str(e)}")
    
    if psycopg2_available:
        try:
            print("\nTesting direct connection with psycopg2...")
            conn = psycopg2.connect(
                dbname=settings.DATABASES['default']['NAME'],
                user=settings.DATABASES['default']['USER'],
                password=settings.DATABASES['default']['PASSWORD'],
                host=settings.DATABASES['default']['HOST'],
                port=settings.DATABASES['default']['PORT']
            )
            print("Direct connection with psycopg2 successful!")
            
            # Get PostgreSQL version
            cursor = conn.cursor()
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            print(f"PostgreSQL version: {version}")
            
            # Check studies table
            cursor.execute("SELECT COUNT(*) FROM studies;")
            count = cursor.fetchone()[0]
            print(f"Total studies in database (direct query): {count}")
            
            cursor.execute("SELECT COUNT(*) FROM studies WHERE overall_status = 'RECRUITING';")
            recruiting = cursor.fetchone()[0]
            print(f"Recruiting studies (direct query): {recruiting}")
            
            cursor.execute("SELECT COUNT(*) FROM studies WHERE overall_status = 'ACTIVE';")
            active = cursor.fetchone()[0]
            print(f"Active studies (direct query): {active}")
            
            cursor.execute("SELECT nct_id, official_title FROM studies WHERE overall_status = 'RECRUITING' LIMIT 5;")
            print("\nSample recruiting studies:")
            for row in cursor.fetchall():
                print(f"- {row[0]}: {row[1]}")
            
            cursor.close()
            conn.close()
            
        except Exception as e:
            print(f"Error with direct psycopg2 connection: {str(e)}")
    
    try:
        # Check Django ORM connection
        print("\nTesting Django ORM connection...")
        
        # Get connection info
        print(f"Django connection: {connection.settings_dict}")
        
        # Count studies
        total = Studies.objects.count()
        print(f"Total studies in database (Django ORM): {total}")
        
        recruiting = Studies.objects.filter(overall_status='RECRUITING').count()
        print(f"Recruiting studies (Django ORM): {recruiting}")
        
        active = Studies.objects.filter(overall_status='ACTIVE').count()
        print(f"Active studies (Django ORM): {active}")
        
        # Get sample studies
        print("\nSample recruiting studies (Django ORM):")
        for study in Studies.objects.filter(overall_status='RECRUITING')[:5]:
            print(f"- {study.nct_id}: {study.official_title}")
        
    except Exception as e:
        print(f"Error with Django ORM: {str(e)}")

if __name__ == "__main__":
    check_db_connection() 