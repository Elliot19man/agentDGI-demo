import { useEffect, useRef } from "react";

/**
 * Rappelle `callback` toutes les `intervalleMs` quand l'onglet est visible.
 * Sous la limite globale de l'API (60 requêtes/min/IP) : 2 s = 30/min.
 * Si l'appel précédent est encore en cours (hébergeur en veille), le tour est
 * sauté plutôt que d'empiler les requêtes.
 */
export function useRafraichirAuto(
  callback: () => void | Promise<unknown>,
  intervalleMs = 2000,
) {
  const enCours = useRef(false);

  useEffect(() => {
    const minuteur = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (enCours.current) return; // un tour précédent n'a pas fini : on saute
      enCours.current = true;
      Promise.resolve(callback()).finally(() => {
        enCours.current = false;
      });
    }, intervalleMs);
    return () => clearInterval(minuteur);
  }, [callback, intervalleMs]);
}
