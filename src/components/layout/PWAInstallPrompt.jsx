import { useState, useEffect } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';
import { getStoredSettings } from '../../utils/storage';

export default function PWAInstallPrompt() {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [settings, setSettings] = useState(() => getStoredSettings());

  useEffect(() => {
    // 1. Listen for storage to sync logo and name
    const handleSync = () => {
      setSettings(getStoredSettings());
    };
    window.addEventListener('storage', handleSync);

    // 2. Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      // Store the event so it can be triggered later
      setInstallPromptEvent(e);
      // Show the install banner
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. Detect if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Update manifest dynamically with admin settings
  useEffect(() => {
    try {
      const myDynamicManifest = {
        short_name: settings.hotelName || "El Khalil",
        name: `${settings.hotelName || "El Khalil Hotel"} - Pyramids View`,
        icons: [
          {
            src: settings.logoType === 'url' ? settings.logoValue : '/favicon.svg',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        start_url: '/',
        background_color: '#12121c',
        theme_color: '#C9973A',
        display: 'standalone',
        orientation: 'portrait'
      };

      const stringManifest = JSON.stringify(myDynamicManifest);
      const blob = new Blob([stringManifest], { type: 'application/json' });
      const manifestURL = URL.createObjectURL(blob);
      
      const link = document.querySelector('link[rel="manifest"]');
      if (link) {
        link.setAttribute('href', manifestURL);
      }
    } catch (err) {
      console.error('Failed to set dynamic manifest:', err);
    }
  }, [settings]);

  const handleInstallClick = () => {
    if (!installPromptEvent) return;

    // Show the install prompt
    installPromptEvent.prompt();

    // Wait for the user to respond to the prompt
    installPromptEvent.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      // Reset the prompt event
      setInstallPromptEvent(null);
      setShowPrompt(false);
    });
  };

  if (!showPrompt) return null;

  const appIcon = settings.logoType === 'url' ? settings.logoValue : '/favicon.svg';

  return (
    <div className="pwa-install-banner">
      <div className="pwa-install-content">
        <img 
          src={appIcon} 
          alt={settings.hotelName} 
          className="pwa-app-icon"
          onError={(e) => { e.target.src = '/favicon.svg'; }}
        />
        <div className="pwa-text-info">
          <h4>Install {settings.hotelName || 'El Khalil'}</h4>
          <p>Add to your home screen for a native app experience</p>
        </div>
      </div>
      <div className="pwa-action-buttons">
        <button className="btn-pwa-install" onClick={handleInstallClick}>
          <FiDownload /> Install
        </button>
        <button className="btn-pwa-dismiss" onClick={() => setShowPrompt(false)} aria-label="Dismiss">
          <FiX />
        </button>
      </div>
    </div>
  );
}
