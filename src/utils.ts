export function formatMontant(valeur: number): string {
  return valeur.toLocaleString("fr-FR") + " Ar";
}

export function formatDate(dateIso: string | null | undefined): string {
  if (!dateIso) return "—";
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return String(dateIso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatMois(mois: string): string {
  const [, m] = mois.split("-").map(Number);
  const noms = ["jan", "fév", "mar", "avr", "mai", "juin", "juil", "aoû", "sep", "oct", "nov", "déc"];
  return noms[(m ?? 1) - 1] ?? mois;
}
