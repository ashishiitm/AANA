import os
import sys
import django
import requests
import json

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from core.email_service import send_enrollment_confirmation
from django.core.mail import send_mail
from django.conf import settings

def test_mailjet_direct():
    """Test sending email directly using Mailjet API"""
    print("Testing direct Mailjet API...")
    
    # Mailjet API credentials
    api_key = "2867d24da863b6b92df808a8958b9f00"
    secret_key = "47230cf8ab876ce422533969f27b4a8e"
    
    url = "https://api.mailjet.com/v3.1/send"
    
    # Email data
    payload = {
        "Messages": [
            {
                "From": {
                    "Email": "ashish.c.chaudhary@gmail.com",
                    "Name": "AANA Clinical Trials"
                },
                "To": [
                    {
                        "Email": "ashish.c.chaudhary@gmail.com",  # Send to yourself for testing
                        "Name": "Ashish Chaudhary"
                    }
                ],
                "Subject": "Test Email from Mailjet API",
                "TextPart": "This is a test email sent directly using the Mailjet API.",
                "HTMLPart": "<h3>Test Email</h3><p>This is a test email sent directly using the Mailjet API.</p>"
            }
        ]
    }
    
    # Send request to Mailjet API
    response = requests.post(
        url,
        auth=(api_key, secret_key),
        json=payload
    )
    
    # Print response
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    return response.status_code == 200

def test_django_email():
    """Test sending email using Django's send_mail function"""
    print("\nTesting Django's send_mail function...")
    
    subject = "Test Email from Django"
    message = "This is a test email sent using Django's send_mail function."
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = ["ashish.c.chaudhary@gmail.com"]  # Send to yourself for testing
    
    try:
        # Send email
        result = send_mail(
            subject,
            message,
            from_email,
            recipient_list,
            fail_silently=False,
        )
        
        # Print result
        print(f"Email sent successfully: {result}")
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False

def test_enrollment_email():
    """Test sending enrollment confirmation email"""
    print("\nTesting enrollment confirmation email...")
    
    # Sample enrollment data
    enrollment_data = {
        "firstName": "Ashish",
        "lastName": "Chaudhary",
        "email": "ashish.c.chaudhary@gmail.com",  # Send to yourself for testing
        "phone": "123-456-7890",
        "studyTitle": "Test Clinical Trial",
        "nct_id": "NCT12345678"
    }
    
    try:
        # Send enrollment confirmation email
        result = send_enrollment_confirmation(enrollment_data)
        
        # Print result
        print(f"Result: {result}")
        return result.get("success", False)
    except Exception as e:
        print(f"Error sending enrollment confirmation email: {str(e)}")
        return False

if __name__ == "__main__":
    print("=== Email Testing Script ===")
    
    # Test direct Mailjet API
    mailjet_result = test_mailjet_direct()
    
    # Test Django's send_mail function
    django_result = test_django_email()
    
    # Test enrollment confirmation email
    enrollment_result = test_enrollment_email()
    
    # Print summary
    print("\n=== Test Results ===")
    print(f"Direct Mailjet API: {'Success' if mailjet_result else 'Failed'}")
    print(f"Django send_mail: {'Success' if django_result else 'Failed'}")
    print(f"Enrollment Email: {'Success' if enrollment_result else 'Failed'}") 