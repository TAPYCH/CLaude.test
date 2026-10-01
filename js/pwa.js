// Service worker registration + install prompt handling.
let deferred = null;

export function initPwa() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
  });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        /* offline support is optional (e.g. sandboxed previews) */
      });
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
