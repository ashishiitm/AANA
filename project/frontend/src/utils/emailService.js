import Mailjet from 'node-mailjet';
import emailjs from 'emailjs-com';

// Initialize Mailjet client with API credentials
const mailjet = Mailjet.apiConnect(
  '2867d24da863b6b92df808a8958b9f00',
  '47230cf8ab876ce422533969f27b4a8e'
);

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'default_service';
const EMAILJS_TEMPLATE_ID = 'enrollment_confirmation';
const EMAILJS_USER_ID = 'YOUR_EMAILJS_USER_ID'; // Replace with your actual EmailJS User ID

/**
 * Initialize EmailJS
 */
export const initEmailJS = () => {
  emailjs.init(EMAILJS_USER_ID);
};

/**
 * Sends an enrollment acknowledgment email to the participant
 * @param {Object} enrollmentData - The enrollment data submitted by the user
 * @returns {Promise} - A promise that resolves when the email is sent
 */
export const sendEnrollmentAcknowledgment = async (enrollmentData) => {
  const { firstName, lastName, email, phone, studyTitle, nctId } = enrollmentData;
  
  try {
    const response = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: "ashish.c.chaudhary@gmail.com", // Your personal Gmail address
            Name: "AANA Clinical Trials"
          },
          To: [
            {
              Email: email,
              Name: `${firstName} ${lastName}`
            }
          ],
          Subject: "Your Enrollment Request is Received",
          HTMLPart: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #4a5568; margin-bottom: 10px;">Thank You for Your Interest</h1>
                <div style="height: 4px; background-color: #3b82f6; width: 100px; margin: 0 auto;"></div>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">Dear ${firstName},</p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
                We have received your enrollment request for the following clinical trial:
              </p>
              
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h2 style="color: #3b82f6; margin-top: 0; font-size: 18px;">${studyTitle}</h2>
                <p style="margin-bottom: 0; color: #64748b;"><strong>NCT ID:</strong> ${nctId}</p>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
                <strong>Important:</strong> This email is an acknowledgment of your request, not a confirmation of enrollment.
                Your information has been forwarded to the study sponsor, who will review your eligibility and contact you directly.
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
                The study team may reach out to you via email (${email}) or phone (${phone}) to discuss next steps,
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
          `,
          CustomID: `enrollment-${nctId}-${Date.now()}`
        }
      ]
    });
    
    console.log('Email sent successfully:', response.body);
    return response.body;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Sends an enrollment acknowledgment email using EmailJS
 * This is a fallback method when the backend email service is unavailable
 * 
 * @param {Object} enrollmentData - The enrollment data submitted by the user
 * @returns {Promise} - A promise that resolves when the email is sent
 */
export const sendEnrollmentAcknowledgmentEmailJS = async (enrollmentData) => {
  const { firstName, lastName, email, phone, studyTitle, nctId } = enrollmentData;
  
  try {
    // Prepare template parameters
    const templateParams = {
      to_name: firstName,
      to_email: email,
      from_name: 'AANA Clinical Trials',
      from_email: 'ashish.c.chaudhary@gmail.com', // Your personal Gmail address
      study_title: studyTitle || 'Clinical Trial Study',
      nct_id: nctId || '',
      phone: phone || 'Not provided',
      full_name: `${firstName} ${lastName}`
    };
    
    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );
    
    console.log('Email sent successfully:', response);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Sends a doctor enrollment acknowledgment email using EmailJS
 * This is used as a fallback when the backend email service fails
 * 
 * @param {Object} enrollmentData - The enrollment data submitted by the doctor
 * @returns {Promise<Object>} - The response from EmailJS
 */
export const sendDoctorEnrollmentAcknowledgmentEmailJS = async (enrollmentData) => {
  const { firstName, lastName, email, phone, studyTitle, nctId, specialty } = enrollmentData;
  
  if (!email) {
    console.error('Email address is required for sending enrollment acknowledgment');
    throw new Error('Email address is required');
  }
  
  const templateParams = {
    to_name: `Dr. ${firstName} ${lastName}`,
    to_email: email,
    study_title: studyTitle || 'Clinical Trial',
    nct_id: nctId || 'Not specified',
    specialty: specialty || 'Not specified',
    message: `
      Thank you for your interest in participating as an investigator in this clinical trial.
      
      We have received your application to participate as a healthcare provider. The trial sponsor will review your credentials and experience to determine if there is a suitable match for your expertise.
      
      Next Steps:
      1. The sponsor will review your application
      2. If there is interest, you will be contacted for further discussion
      3. Additional training and documentation may be required
      4. Final selection decisions will be made by the sponsor
      
      Important: This email is an acknowledgment of your application, not a confirmation of selection.
    `
  };
  
  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      'doctor_enrollment_confirmation', // Template ID for doctor enrollment
      templateParams,
      EMAILJS_USER_ID
    );
    
    console.log('Doctor enrollment acknowledgment email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending doctor enrollment acknowledgment email:', error);
    throw error;
  }
}; 