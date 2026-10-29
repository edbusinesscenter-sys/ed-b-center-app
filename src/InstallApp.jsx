import { useEffect, useState } from "react";
import "./install.css";

// Bouton « Installer l'application » : Android (invitation Chrome) et iPhone (instructions Safari).
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

export default function InstallApp() {
  const [canInstall, setCanInstall] = useState(!!window.deferredInstallPrompt);
  const [showIos, setShowIos] = useState(false);
  const [hidden, setHidden] = useState(isStandalone());

  useEffect(() => {
    const onAvailable = () => setCanInstall(true);
    const onDone = () => { setCanInstall(false); setHidden(true); };
    window.addEventListener("ed-install-available", onAvailable);
    window.addEventListener("ed-install-done", onDone);
    return () => {
      window.removeEventListener("ed-install-available", onAvailable);
      window.removeEventListener("ed-install-done", onDone);
    };
  }, []);

  if (hidden) return null;
  if (!canInstall && !isIos()) return null;

  async function install() {
    const prompt = window.deferredInstallPrompt;
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice;
    window.deferredInstallPrompt = null;
    setCanInstall(false);
  }

  return (
    <>
      <button type="button" className="install-app-button" onClick={canInstall ? install : () => setShowIos(true)}>
        Installer l'application
      </button>
      {showIos && (
        <div className="install-backdrop" role="presentation" onClick={() => setShowIos(false)}>
          <div className="install-sheet" role="dialog" aria-modal="true" aria-label="Installer" onClick={(e) => e.stopPropagation()}>
            <strong>Installer sur iPhone</strong>
            <ol>
              <li>Touche le bouton <b>Partager</b> (carré avec une flèche).</li>
              <li>Touche <b>« Sur l'écran d'accueil »</b>.</li>
              <li>Touche <b>Ajouter</b>.</li>
            </ol>
            <button type="button" className="button button-outline" onClick={() => setShowIos(false)}>Fermer</button>
          </div>
        </div>
      )}
    </>
  );
}
