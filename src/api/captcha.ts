const CLE_SITE = '6Lc9pxwuAAAAAP9-0E50qwovWrWDAFidGyhuoTzS';

// Renvoie un jeton reCAPTCHA v3 prêt à être envoyé à l'API.
// Si le script n'a pas encore chargé ou si Google est indisponible,
// renvoie une chaîne vide : le serveur répondra « anti-robot requis ».
declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export function obtenirJetonCaptcha(): Promise<string> {
  return new Promise((resolve) => {
    const grecaptcha = window.grecaptcha;
    if (!grecaptcha?.execute) {
      resolve('');
      return;
    }
    grecaptcha.ready(async () => {
      try {
        const jeton = await grecaptcha.execute(CLE_SITE, { action: 'submit' });
        resolve(jeton);
      } catch {
        resolve('');
      }
    });
    setTimeout(() => resolve(''), 10000);
  });
}
