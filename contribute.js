// Contribution form handler - sends email via mailto link

const RECIPIENT_EMAIL = 'electa.kyv@gmail.com';

document.addEventListener('DOMContentLoaded', () => {
  // Handle form submission
  const form = document.getElementById('contributeForm');
  const sendBtn = document.getElementById('sendBtn');
  const contributeTypeSelect = document.getElementById('contributeType');
  
  form.addEventListener('submit', (e) => {
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

    // Get current timestamp
    const timestamp = new Date().toLocaleString('en-AU', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: 'Australia/Hobart'
    });
    
    // Prepare email subject and body
    const subject = encodeURIComponent(`Electa Contribution: ${contributionType}`);
    const emailBody = encodeURIComponent(
      `Contribution Type: ${contributionType}\n\n` +
      `Message:\n${message}\n\n` +
      `Submitted: ${timestamp}`
    );
    
    // Create mailto link
    const mailtoLink = `mailto:${RECIPIENT_EMAIL}?subject=${subject}&body=${emailBody}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Clear the form after a short delay
    setTimeout(() => {
      form.reset();
      alert('Your email client should open. Please send the email to complete your contribution.');
    }, 500);
  });
});
