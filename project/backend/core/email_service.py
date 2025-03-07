import requests
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

# Mailjet API credentials
MAILJET_API_KEY = "2867d24da863b6b92df808a8958b9f00"
MAILJET_SECRET_KEY = "47230cf8ab876ce422533969f27b4a8e"
MAILJET_API_URL = "https://api.mailjet.com/v3.1/send"

def send_enrollment_confirmation(enrollment_data):
    """
    Send an enrollment confirmation email to the participant
    
    Args:
        enrollment_data (dict): Dictionary containing enrollment information
    
    Returns:
        dict: Response from the Mailjet API
    """
    try:
        first_name = enrollment_data.get('firstName', '')
        last_name = enrollment_data.get('lastName', '')
        email = enrollment_data.get('email', '')
        phone = enrollment_data.get('phone', '')
        study_title = enrollment_data.get('studyTitle', 'Clinical Trial')
        nct_id = enrollment_data.get('nct_id', '')
        
        # Prepare email data
        email_data = {
            "Messages": [
                {
                    "From": {
                        "Email": "ashish.c.chaudhary@gmail.com",
                        "Name": "AANA Clinical Trials"
                    },
                    "To": [
                        {
                            "Email": email,
                            "Name": f"{first_name} {last_name}"
                        }
                    ],
                    "Subject": "Your Enrollment Request is Received",
                    "HTMLPart": f"""
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                      <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #4a5568; margin-bottom: 10px;">Thank You for Your Interest</h1>
                        <div style="height: 4px; background-color: #3b82f6; width: 100px; margin: 0 auto;"></div>
                      </div>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">Dear {first_name},</p>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
                        We have received your enrollment request for the following clinical trial:
                      </p>
                      
                      <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h2 style="color: #3b82f6; margin-top: 0; font-size: 18px;">{study_title}</h2>
                        <p style="margin-bottom: 0; color: #64748b;"><strong>NCT ID:</strong> {nct_id}</p>
                      </div>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
                        <strong>Important:</strong> This email is an acknowledgment of your request, not a confirmation of enrollment. 
                        Your information has been forwarded to the study sponsor, who will review your eligibility and contact you directly.
                      </p>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
                        The study team may reach out to you via email ({email}) or phone ({phone}) to discuss next steps, 
                        including scheduling a screening visit to determine if you meet all eligibility criteria.
                      </p>
                      
                      <div style="margin: 30px 0; padding: 15px; border-left: 4px solid #3b82f6; background-color: #f0f9ff;">
                        <p style="margin: 0; color: #4a5568;">
                          <strong>What happens next?</strong><br>
                          1. A study coordinator will review your information<br>
                          2. You may be contacted for additional screening questions<br>
                          3. If eligible, you'll be invited for an in-person screening visit<br>
                          4. Final enrollment decisions will be made after the screening process
                        </p>
                      </div>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
                        If you have any questions or need to update your contact information, please reply to this email
                        or call our support team at (800) 555-1234.
                      </p>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
                        Thank you for your interest in advancing medical research through clinical trial participation.
                      </p>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
                        Warm regards,<br>
                        The AANA Clinical Trials Team
                      </p>
                      
                      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #94a3b8; text-align: center;">
                        <p>This is an automated message. Please do not reply directly to this email.</p>
                        <p>© 2023 AANA Clinical Trials. All rights reserved.</p>
                      </div>
                    </div>
                    """,
                    "CustomID": f"enrollment-{nct_id}-{first_name}-{last_name}"
                }
            ]
        }
        
        # Send email via Mailjet API
        response = requests.post(
            MAILJET_API_URL,
            auth=(MAILJET_API_KEY, MAILJET_SECRET_KEY),
            json=email_data
        )
        
        if response.status_code == 200:
            logger.info(f"Enrollment confirmation email sent to {email}")
            return {"success": True, "message": "Email sent successfully"}
        else:
            logger.error(f"Failed to send email: {response.text}")
            return {"success": False, "message": "Failed to send email", "details": response.text}
            
    except Exception as e:
        logger.exception(f"Error sending enrollment confirmation email: {str(e)}")
        return {"success": False, "message": "Error sending email", "details": str(e)}

def send_doctor_enrollment_confirmation(enrollment_data):
    """
    Send an enrollment confirmation email to the healthcare provider
    
    Args:
        enrollment_data (dict): Dictionary containing enrollment information
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        # Extract data from the enrollment request
        first_name = enrollment_data.get('firstName', '')
        last_name = enrollment_data.get('lastName', '')
        email = enrollment_data.get('email', '')
        phone = enrollment_data.get('phone', '')
        study_title = enrollment_data.get('studyTitle', 'Clinical Trial')
        nct_id = enrollment_data.get('nct_id', '')
        specialty = enrollment_data.get('specialty', '')
        
        # Prepare email content
        html_content = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                h1 {{ color: #2c5282; }}
                .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Healthcare Provider Application Received</h1>
                
                <p>Dear Dr. {first_name} {last_name},</p>
                
                <p>Thank you for your interest in participating as an investigator in the following clinical trial:</p>
                
                <p><strong>Trial:</strong> {study_title}<br>
                <strong>NCT ID:</strong> {nct_id}</p>
                
                <p>We have received your application to participate as a healthcare provider. The trial sponsor will review your credentials and experience to determine if there is a suitable match for your expertise in {specialty}.</p>
                
                <p><strong>Next Steps:</strong></p>
                <ol>
                    <li>The sponsor will review your application</li>
                    <li>If there is interest, you will be contacted for further discussion</li>
                    <li>Additional training and documentation may be required</li>
                    <li>Final selection decisions will be made by the sponsor</li>
                </ol>
                
                <p><strong>Important:</strong> This email is an acknowledgment of your application, not a confirmation of selection.</p>
                
                <p>If you have any questions, please contact us at <a href="mailto:trials@example.com">trials@example.com</a> or call (555) 123-4567.</p>
                
                <p>Thank you for your interest in advancing clinical research.</p>
                
                <p>Best regards,<br>
                Clinical Trials Team</p>
                
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        text_content = f"""
        Healthcare Provider Application Received
        
        Dear Dr. {first_name} {last_name},
        
        Thank you for your interest in participating as an investigator in the following clinical trial:
        
        Trial: {study_title}
        NCT ID: {nct_id}
        
        We have received your application to participate as a healthcare provider. The trial sponsor will review your credentials and experience to determine if there is a suitable match for your expertise in {specialty}.
        
        Next Steps:
        1. The sponsor will review your application
        2. If there is interest, you will be contacted for further discussion
        3. Additional training and documentation may be required
        4. Final selection decisions will be made by the sponsor
        
        Important: This email is an acknowledgment of your application, not a confirmation of selection.
        
        If you have any questions, please contact us at trials@example.com or call (555) 123-4567.
        
        Thank you for your interest in advancing clinical research.
        
        Best regards,
        Clinical Trials Team
        
        This is an automated message. Please do not reply to this email.
        """
        
        # Send email using Mailjet
        data = {
            "Messages": [
                {
                    "From": {
                        "Email": settings.MAILJET_SENDER_EMAIL,
                        "Name": "Clinical Trials Team"
                    },
                    "To": [
                        {
                            "Email": email,
                            "Name": f"Dr. {first_name} {last_name}"
                        }
                    ],
                    "Subject": "Your Application to Participate in Clinical Trial",
                    "TextPart": text_content,
                    "HTMLPart": html_content,
                    "CustomID": f"doctor-enrollment-{nct_id}-{first_name}-{last_name}"
                }
            ]
        }
        
        response = requests.post(
            MAILJET_API_URL,
            auth=(MAILJET_API_KEY, MAILJET_SECRET_KEY),
            json=data
        )
        
        if response.status_code == 200:
            logger.info(f"Doctor enrollment confirmation email sent to {email}")
            return True
        else:
            logger.error(f"Failed to send doctor enrollment email: {response.reason}")
            return False
            
    except Exception as e:
        logger.exception(f"Error sending doctor enrollment confirmation email: {str(e)}")
        return False 