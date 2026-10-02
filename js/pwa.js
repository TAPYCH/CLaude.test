// Service worker registration + install prompt handling.
let deferred = null;

export function initPwa() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
  });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    const hadController = !!navigator.serviceWorker.controller;
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js')
        .then((reg) => {
          // look for a new version whenever the app comes back to the foreground
          document.addEventListener('visibilitychange', () => {
            if (!document.hidden) reg.update().catch(() => {});
          });
        })
        .catch(() => {
          /* offline support is optional (e.g. sandboxed previews) */
        });
    });
    // a new version took over: tell the game (it offers a reload at a safe moment)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController) window.dispatchEvent(new window.Event('app-update'));
    });
  }
}

export const canInstall = () => !!deferred;

export async function install() {
  if (!deferred) return false;
  deferred.prompt();
  const res = await deferred.userChoice;
  deferred = null;
  return res.outcome === 'accepted';
}

export const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
