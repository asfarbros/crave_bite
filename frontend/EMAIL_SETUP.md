# EmailJS Setup Guide for CraveBite Booking System

## Overview
This guide will help you set up EmailJS to send real confirmation emails when customers book tables at CraveBite restaurant.

## Step 1: Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Add Email Service
1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the authentication steps
5. Note down your **Service ID** (e.g., `service_abc123`)

## Step 3: Create Email Template
1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use the HTML template from `email-template.html` as your base
4. Replace the template variables:
   - `{{to_name}}` - Customer's name
   - `{{table_number}}` - Selected table number
   - `{{booking_date}}` - Booking date
   - `{{booking_time}}` - Booking time
   - `{{restaurant_name}}` - Restaurant name
5. Save the template and note down your **Template ID** (e.g., `template_xyz789`)

## Step 4: Get Your Public Key
1. Go to "Account" → "API Keys"
2. Copy your **Public Key** (e.g., `user_def456`)

## Step 5: Update the Code
Replace the placeholder values in `src/pages/Booking.jsx` (EmailJS is initialized in `index.html` via the CDN script tag, and `service`/`template` IDs are passed directly to `emailjs.send(...)` in `Booking.jsx` and `Home.jsx`):

```javascript
// src/main.jsx — initializes EmailJS once at startup
emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your actual public key

// src/pages/Booking.jsx and src/pages/Home.jsx — send email
emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
```

Example with real values:
```javascript
emailjs.init("user_def456");
emailjs.send('service_abc123', 'template_xyz789', templateParams)
```

## Step 6: Test the Email Functionality
1. Open `booking.html` in your browser
2. Select a table and fill in the booking form
3. Include a valid email address
4. Click "Confirm Booking"
5. Check the email inbox for the confirmation

## Email Template Variables
The following variables are available in your email template:
- `{{to_name}}` - Customer's full name
- `{{to_email}}` - Customer's email address
- `{{table_number}}` - Selected table number
- `{{booking_date}}` - Selected booking date
- `{{booking_time}}` - Selected booking time
- `{{restaurant_name}}` - Restaurant name (CraveBite)

## Troubleshooting
1. **Email not sending**: Check browser console for errors
2. **Invalid service ID**: Verify your EmailJS service ID
3. **Template not found**: Ensure template ID is correct
4. **Authentication issues**: Re-authenticate your email service

## Security Notes
- Never expose your EmailJS private keys in client-side code
- Use environment variables for sensitive data in production
- Consider rate limiting to prevent abuse
- Monitor email sending quotas

## Production Deployment
For production use:
1. Set up proper domain verification
2. Configure SPF/DKIM records
3. Monitor email delivery rates
4. Set up email analytics
5. Consider using a dedicated email service for high volume

## Support
- EmailJS Documentation: https://www.emailjs.com/docs/
- EmailJS Support: support@emailjs.com
- GitHub Issues: https://github.com/emailjs/emailjs-com 