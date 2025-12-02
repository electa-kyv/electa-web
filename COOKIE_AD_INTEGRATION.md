# Cookie Consent & Ad Integration Guide

This document explains how to use the cookie consent and ad integration system for your Electa website.

## Files Created

1. **cookie-consent.css** - Styling for cookie banner, modal, and ad slots
2. **cookie-consent.js** - JavaScript for managing cookie consent and ad loading
3. **COOKIE_AD_INTEGRATION.md** - This documentation file

## Features

### 1. Cookie Consent Banner

- Displays at the bottom of the page on first visit
- Two options: "Accept All" or "Manage Preferences"
- Link to privacy policy
- Remembers user choice in localStorage
- Smooth fade-in/out transitions

### 2. Cookie Preferences Modal

Users can manage three types of cookies:

- **Necessary Cookies** (always enabled) - Essential for website functionality
- **Analytics Cookies** (optional) - Track website usage
- **Advertising Cookies** (optional) - Enable personalized ads

### 3. Ad Slots

#### Google AdSense Ads (Require Cookie Consent)
- Class: `.ad-slot-google`
- Only display when user accepts advertising cookies
- Positions: top, middle, bottom, sidebar
- Fade-in animation when loaded

#### Electa Partner Ads (Always Visible)
- Class: `.ad-slot-partner`
- Always visible regardless of consent
- Visually distinct with gradient background and dashed border
- Positions: top, middle, bottom, sidebar

## How to Use

### Basic Setup

The cookie consent system is already integrated into `blog.html` and `article.html`. To add it to other pages:

1. Add the CSS file to your `<head>`:
```html
<link rel="stylesheet" href="cookie-consent.css" />
```

2. Add the JavaScript file before closing `</body>`:
```html
<script src="cookie-consent.js"></script>
```

### Adding Google AdSense Ads

1. **Get your AdSense Publisher ID** from Google AdSense dashboard

2. **Update the AdSense script** in `cookie-consent.js` (line ~260):
```javascript
// Uncomment and add your AdSense client ID
script.dataset.adClient = 'ca-pub-XXXXXXXXXXXXXXXX';
```

3. **Add AdSense ad units** to your HTML:
```html
<div class="ad-slot-google ad-slot-top" data-ad-position="top">
  <ins class="adsbygoogle"
       style="display:block"
       data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
       data-ad-slot="XXXXXXXXXX"
       data-ad-format="auto"
       data-full-width-responsive="true"></ins>
</div>
```

4. Replace:
   - `ca-pub-XXXXXXXXXXXXXXXX` with your AdSense Publisher ID
   - `XXXXXXXXXX` with your Ad Unit ID

### Adding Partner Ads

Partner ads are simple HTML placeholders. Replace the content with your actual ad code:

```html
<div class="ad-slot-partner ad-slot-top" data-ad-position="partner-top">
  <!-- Replace this content with your partner ad code -->
  <div class="ad-partner-content">
    <div class="ad-partner-icon">💡</div>
    <div class="ad-partner-text">Your ad here – Electa Partner Opportunity!</div>
    <div class="ad-partner-subtext">Reach engaged voters and community members</div>
  </div>
</div>
```

### Ad Positions

Available positions for both Google and Partner ads:

- `ad-slot-top` - Top of page
- `ad-slot-middle` - Middle of content
- `ad-slot-bottom` - Bottom of page
- `ad-slot-sidebar` - Sidebar (desktop only)

## JavaScript API

### Access the Cookie Consent Instance

```javascript
// Check if user has given consent
if (window.cookieConsent.hasConsent()) {
  console.log('User has given consent');
}

// Check specific consent type
if (window.cookieConsent.hasConsentFor('advertising')) {
  console.log('User accepts advertising cookies');
}

// Revoke consent (useful for testing or user request)
window.cookieConsent.revokeConsent();

// Show preferences modal programmatically
window.cookieConsent.showModal();
```

### Listen to Consent Changes

```javascript
window.addEventListener('cookieConsentUpdated', (event) => {
  console.log('Cookie preferences updated:', event.detail);
  // event.detail contains: { necessary, analytics, advertising, timestamp }
});
```

## Adding Cookie Settings Link

Add a link anywhere on your site to let users change their preferences:

```html
<!-- Using class -->
<a href="#" class="cookie-settings-link">Cookie Settings</a>

<!-- Using data attribute -->
<button data-cookie-settings>Manage Cookies</button>
```

The system automatically adds click handlers to these elements.

## Styling Customization

### Cookie Banner Colors

Edit `cookie-consent.css` to customize colors:

```css
.cookie-consent-banner {
  background: rgba(14, 28, 47, 0.98); /* Change background */
  border-top: 1px solid rgba(255, 255, 255, 0.2); /* Change border */
}

.cookie-btn-accept {
  background: var(--marine-400); /* Change button color */
}
```

### Partner Ad Styling

Customize partner ad appearance:

```css
.ad-slot-partner {
  background: linear-gradient(135deg, rgba(75, 115, 162, 0.1), rgba(39, 73, 109, 0.1));
  border: 2px dashed rgba(75, 115, 162, 0.4);
}
```

## Testing

### Test Cookie Consent Flow

1. Open your blog page in a private/incognito window
2. You should see the cookie banner at the bottom
3. Click "Manage Preferences" to test the modal
4. Toggle different cookie types
5. Save preferences and verify ads load correctly

### Test Ad Loading

1. Accept advertising cookies
2. Google ads should fade in (if AdSense is configured)
3. Partner ads should always be visible
4. Open browser console to check for any errors

### Clear Consent (for testing)

Open browser console and run:
```javascript
window.cookieConsent.revokeConsent();
location.reload();
```

## Privacy Compliance

The cookie consent system helps comply with:

- **GDPR** (EU General Data Protection Regulation)
- **CCPA** (California Consumer Privacy Act)
- **ePrivacy Directive** (Cookie Law)

### Important Notes

1. Update your `privacy.html` page with details about:
   - What cookies you use
   - Why you use them
   - How users can manage them
   - Third-party services (Google AdSense, etc.)

2. The consent is stored in localStorage:
   - `electa_cookie_consent` - Whether consent was given
   - `electa_cookie_preferences` - User's cookie preferences

3. Consent is persistent until:
   - User clears browser data
   - User revokes consent
   - You clear it programmatically

## Troubleshooting

### Ads Not Showing

1. Check browser console for errors
2. Verify AdSense script is loading
3. Confirm user has accepted advertising cookies
4. Check AdSense account is approved and active

### Banner Not Appearing

1. Check if consent already exists in localStorage
2. Clear localStorage and reload page
3. Verify `cookie-consent.js` is loaded

### Modal Not Working

1. Check for JavaScript errors in console
2. Verify `cookie-consent.css` is loaded
3. Ensure no CSS conflicts with existing styles

## Support

For issues or questions:
1. Check browser console for errors
2. Review this documentation
3. Test in private/incognito mode
4. Clear localStorage and test fresh

## Example: Full Page Integration

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Page</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="cookie-consent.css">
</head>
<body>
  <!-- Your content -->
  
  <!-- Google Ad (requires consent) -->
  <div class="ad-slot-google ad-slot-top">
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
         data-ad-slot="XXXXXXXXXX"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
  </div>
  
  <!-- Partner Ad (always visible) -->
  <div class="ad-slot-partner ad-slot-bottom">
    <div class="ad-partner-content">
      <div class="ad-partner-icon">💡</div>
      <div class="ad-partner-text">Your ad here!</div>
    </div>
  </div>
  
  <script src="cookie-consent.js"></script>
</body>
</html>
```

---

**Last Updated:** December 2024

