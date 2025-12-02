// Cookie Consent Management System

class CookieConsent {
  constructor() {
    this.consentKey = 'electa_cookie_consent';
    this.preferencesKey = 'electa_cookie_preferences';
    this.defaultPreferences = {
      necessary: true, // Always true, can't be disabled
      analytics: false,
      advertising: false,
      timestamp: null
    };
    this.preferences = this.loadPreferences();
    this.init();
  }

  init() {
    // Create consent banner
    this.createBanner();
    
    // Create preferences modal
    this.createModal();
    
    // Check if consent has been given
    if (!this.hasConsent()) {
      this.showBanner();
    } else {
      // Load ads if consent was previously given
      this.applyConsent();
    }

    // Add settings link functionality
    this.setupSettingsLinks();
  }

  hasConsent() {
    return localStorage.getItem(this.consentKey) !== null;
  }

  loadPreferences() {
    try {
      const saved = localStorage.getItem(this.preferencesKey);
      if (saved) {
        return { ...this.defaultPreferences, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Error loading cookie preferences:', error);
    }
    return { ...this.defaultPreferences };
  }

  savePreferences(preferences) {
    this.preferences = {
      ...preferences,
      necessary: true, // Always true
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(this.preferencesKey, JSON.stringify(this.preferences));
    localStorage.setItem(this.consentKey, 'true');
  }

  createBanner() {
    const banner = document.createElement('div');
    banner.className = 'cookie-consent-banner';
    banner.id = 'cookieConsentBanner';
    banner.innerHTML = `
      <div class="cookie-consent-content">
        <div class="cookie-consent-text">
          We use cookies to enhance your experience and show relevant ads. By continuing, you agree to our 
          <a href="privacy.html">Privacy Policy</a>.
        </div>
        <div class="cookie-consent-actions">
          <button class="cookie-btn cookie-btn-manage" id="manageCookiesBtn">
            Manage Preferences
          </button>
          <button class="cookie-btn cookie-btn-accept" id="acceptCookiesBtn">
            Accept All
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    // Add event listeners
    document.getElementById('acceptCookiesBtn').addEventListener('click', () => {
      this.acceptAll();
    });

    document.getElementById('manageCookiesBtn').addEventListener('click', () => {
      this.hideBanner();
      this.showModal();
    });
  }

  createModal() {
    const modal = document.createElement('div');
    modal.className = 'cookie-modal-overlay';
    modal.id = 'cookieModal';
    modal.innerHTML = `
      <div class="cookie-modal">
        <div class="cookie-modal-header">
          <h2>Cookie Preferences</h2>
          <button class="cookie-modal-close" id="closeModalBtn" aria-label="Close">&times;</button>
        </div>
        <div class="cookie-modal-body">
          <div class="cookie-preference-item">
            <div class="cookie-preference-header">
              <h3>Necessary Cookies</h3>
              <div class="cookie-toggle active disabled">
                <div class="cookie-toggle-slider"></div>
              </div>
            </div>
            <p class="cookie-preference-description">
              These cookies are essential for the website to function properly. They enable basic features like page navigation and access to secure areas.
            </p>
          </div>

          <div class="cookie-preference-item">
            <div class="cookie-preference-header">
              <h3>Analytics Cookies</h3>
              <div class="cookie-toggle" id="analyticsToggle" data-preference="analytics">
                <div class="cookie-toggle-slider"></div>
              </div>
            </div>
            <p class="cookie-preference-description">
              These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
            </p>
          </div>

          <div class="cookie-preference-item">
            <div class="cookie-preference-header">
              <h3>Advertising Cookies</h3>
              <div class="cookie-toggle" id="advertisingToggle" data-preference="advertising">
                <div class="cookie-toggle-slider"></div>
              </div>
            </div>
            <p class="cookie-preference-description">
              These cookies are used to show you ads that are relevant to your interests. They also help measure the effectiveness of advertising campaigns.
            </p>
          </div>
        </div>
        <div class="cookie-modal-footer">
          <button class="cookie-btn cookie-btn-manage" id="rejectAllBtn">
            Reject All
          </button>
          <button class="cookie-btn cookie-btn-accept" id="savePreferencesBtn">
            Save Preferences
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Set initial toggle states
    this.updateToggleStates();

    // Add event listeners
    document.getElementById('closeModalBtn').addEventListener('click', () => {
      this.hideModal();
      if (!this.hasConsent()) {
        this.showBanner();
      }
    });

    document.getElementById('savePreferencesBtn').addEventListener('click', () => {
      this.saveCurrentPreferences();
    });

    document.getElementById('rejectAllBtn').addEventListener('click', () => {
      this.rejectAll();
    });

    // Toggle click handlers
    document.querySelectorAll('.cookie-toggle:not(.disabled)').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const preference = toggle.dataset.preference;
        if (preference) {
          this.preferences[preference] = !this.preferences[preference];
          this.updateToggleStates();
        }
      });
    });

    // Close modal when clicking overlay
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hideModal();
        if (!this.hasConsent()) {
          this.showBanner();
        }
      }
    });
  }

  updateToggleStates() {
    const analyticsToggle = document.getElementById('analyticsToggle');
    const advertisingToggle = document.getElementById('advertisingToggle');

    if (analyticsToggle) {
      analyticsToggle.classList.toggle('active', this.preferences.analytics);
    }
    if (advertisingToggle) {
      advertisingToggle.classList.toggle('active', this.preferences.advertising);
    }
  }

  showBanner() {
    const banner = document.getElementById('cookieConsentBanner');
    if (banner) {
      setTimeout(() => banner.classList.add('show'), 100);
    }
  }

  hideBanner() {
    const banner = document.getElementById('cookieConsentBanner');
    if (banner) {
      banner.classList.remove('show');
    }
  }

  showModal() {
    const modal = document.getElementById('cookieModal');
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  hideModal() {
    const modal = document.getElementById('cookieModal');
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  acceptAll() {
    this.savePreferences({
      necessary: true,
      analytics: true,
      advertising: true
    });
    this.hideBanner();
    this.applyConsent();
    this.showSuccessMessage('All cookies accepted');
  }

  rejectAll() {
    this.savePreferences({
      necessary: true,
      analytics: false,
      advertising: false
    });
    this.hideModal();
    this.applyConsent();
    this.showSuccessMessage('Only necessary cookies enabled');
  }

  saveCurrentPreferences() {
    this.savePreferences(this.preferences);
    this.hideModal();
    this.applyConsent();
    this.showSuccessMessage('Cookie preferences saved');
  }

  applyConsent() {
    // Load Google Ads if advertising consent is given
    if (this.preferences.advertising) {
      this.loadGoogleAds();
    } else {
      this.hideGoogleAds();
    }

    // Load analytics if consent is given
    if (this.preferences.analytics) {
      this.loadAnalytics();
    }

    // Dispatch custom event for other scripts to listen to
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
      detail: this.preferences
    }));
  }

  loadGoogleAds() {
    const adSlots = document.querySelectorAll('.ad-slot-google');
    adSlots.forEach(slot => {
      slot.classList.add('consent-given', 'ad-fade-in');
      
      // Check if AdSense script is already loaded
      if (!window.adsbygoogle) {
        this.loadAdSenseScript();
      }
      
      // Initialize ads in this slot if not already done
      if (!slot.dataset.initialized) {
        this.initializeAdSlot(slot);
        slot.dataset.initialized = 'true';
      }
    });
  }

  hideGoogleAds() {
    const adSlots = document.querySelectorAll('.ad-slot-google');
    adSlots.forEach(slot => {
      slot.classList.remove('consent-given');
    });
  }

  loadAdSenseScript() {
    // Only load if not already present
    if (document.querySelector('script[src*="adsbygoogle"]')) {
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8906392448287945';
    script.crossOrigin = 'anonymous';
    
    script.onerror = () => {
      console.warn('Failed to load Google AdSense script');
    };

    document.head.appendChild(script);
  }

  initializeAdSlot(slot) {
    // Show loading state
    slot.innerHTML = '<div class="ad-loading">Loading advertisement...</div>';

    // Check if slot already has ad content
    const existingAd = slot.querySelector('ins.adsbygoogle');
    if (existingAd && !existingAd.dataset.adsbygoogleStatus) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        slot.classList.add('loaded');
      } catch (error) {
        console.error('Error initializing ad:', error);
      }
    }
  }

  loadAnalytics() {
    // Placeholder for analytics loading (e.g., Google Analytics)
    // Example:
    // if (!window.gtag) {
    //   const script = document.createElement('script');
    //   script.async = true;
    //   script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
    //   document.head.appendChild(script);
    //   
    //   window.dataLayer = window.dataLayer || [];
    //   function gtag(){dataLayer.push(arguments);}
    //   gtag('js', new Date());
    //   gtag('config', 'GA_MEASUREMENT_ID');
    // }
    console.log('Analytics enabled');
  }

  setupSettingsLinks() {
    // Add click handlers to any cookie settings links
    document.addEventListener('click', (e) => {
      if (e.target.matches('.cookie-settings-link, [data-cookie-settings]')) {
        e.preventDefault();
        this.showModal();
      }
    });
  }

  showSuccessMessage(message) {
    // Create temporary success message
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(76, 175, 80, 0.95);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10001;
      animation: slideInRight 0.3s ease;
    `;
    successDiv.textContent = message;
    document.body.appendChild(successDiv);

    setTimeout(() => {
      successDiv.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => successDiv.remove(), 300);
    }, 3000);
  }

  // Public method to revoke consent
  revokeConsent() {
    localStorage.removeItem(this.consentKey);
    localStorage.removeItem(this.preferencesKey);
    this.preferences = { ...this.defaultPreferences };
    this.hideGoogleAds();
    this.showBanner();
  }

  // Public method to check if specific consent is given
  hasConsentFor(type) {
    return this.preferences[type] === true;
  }
}

// Animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize cookie consent when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.cookieConsent = new CookieConsent();
  });
} else {
  window.cookieConsent = new CookieConsent();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CookieConsent;
}

