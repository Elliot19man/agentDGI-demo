import { useEffect } from "react";

/**
 * Rappelle `callback` toutes les `intervalleMs` quand l'onglet est visible.
 * Sous la limite globale de l'API (60 requêtes/min/IP) : 2 s = 30/min.
 */
export function useRafraichirAuto(callback: () => void, intervalleMs = 2000) {
  useEffect(() => {
    const minuteur = setInterval(() => {
      if (document.visibilityState === "visible") callback();
    }, intervalleMs);
    return () => clearInterval(minuteur);
  }, [callback, intervalleMs]);
}
