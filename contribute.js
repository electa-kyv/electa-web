// EmailJS Configuration
const EMAILJS_PUBLIC_KEY = 'fDK-ZKgTUBC1gA8en';
const EMAILJS_SERVICE_ID = 'service_7d7pxfp';
const EMAILJS_TEMPLATE_ID = 'template_uz2prhf';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize EmailJS
  emailjs.init(EMAILJS_PUBLIC_KEY);

  // Handle form submission
  const form = document.getElementById('contributeForm');
  const sendBtn = document.getElementById('sendBtn');
  const contributeTypeSelect = document.getElementById('contributeType');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get contribution type from dropdown
    const contributionType = contributeTypeSelect.value.trim();
    
    // Validate that a contribution type is selected
    if (!contributionType) {
      alert('Please select a contribution type first.');
      return;
    }

    const message = document.getElementById('contributeMessage').value.trim();
    
    if (!message) {
      alert('Please enter a message.');
      return;
    }

    // Disable send button during submission
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';

    try {
      // Get current timestamp
      const timestamp = new Date().toLocaleString('en-AU', {
        dateStyle: 'full',
        timeStyle: 'long',
        timeZone: 'Australia/Hobart'
      });
      
      // Get browser information
      const browser = navigator.userAgent;
      
      // Prepare email template parameters
      const templateParams = {
        subject: `Electa Contribution: ${contributionType}`,
        contributionType: contributionType,
        message: message,
        timestamp: timestamp,
        browser: browser
      };

      // Send email via EmailJS
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);

      // Success
      alert('Thank you! Your contribution has been submitted.');
      
      // Clear the form
      form.reset();
      
    } catch (error) {
      console.error('EmailJS error:', error);
      alert('There was an error sending your contribution. Please try again.');
    } finally {
      // Re-enable send button
      sendBtn.disabled = false;
      sendBtn.textContent = 'Send';
    }
  });
});

