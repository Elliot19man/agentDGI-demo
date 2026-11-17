import { useCallback, useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { api } from "../api/client";
import { useRafraichirAuto } from "../hooks/useRafraichirAuto";

export interface Colonne<T> {
  etiquette: string;
  render: (ligne: T) => React.ReactNode;
}

export interface Props<T> {
  titre: string;
  sousTitre: string;
  endpoint: string | ((page: number, recherche: string) => string);
  champListe: string;
  colonnes: Colonne<T>[];
  placeholderRecherche: string;
  lignesParPage?: number;
}

export default function ListePaginee<T extends { id: number }>({
  titre,
  sousTitre,
  endpoint,
  champListe,
  colonnes,
  placeholderRecherche,
  lignesParPage = 20,
}: Props<T>) {
  const [recherche, setRecherche] = useState("");
  const [termes, setTermes] = useState("");
  const [lignes, setLignes] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  // Silencieux après le premier chargement : les données suivent l'agent
  // sans que le tableau s'efface toutes les 2 s.
  const charger = useCallback(async () => {
    try {
      const chemin =
        typeof endpoint === "function"
          ? endpoint(page, termes)
          : `${endpoint}?page=${page}&limite=${lignesParPage}${termes ? `&recherche=${encodeURIComponent(termes)}` : ""}`;
      const { data } = await api.get(chemin);
      setLignes((data[champListe] ?? []) as T[]);
      setTotal(data.total ?? 0);
      setErreur("");
    } catch (err: any) {
      setErreur(err.response?.data?.message || "Erreur de chargement");
    } finally {
      setChargement(false);
    }
  }, [endpoint, champListe, lignesParPage, page, termes]);

  useEffect(() => {
    const minuteur = setTimeout(() => setTermes(recherche), 350);
    return () => clearTimeout(minuteur);
  }, [recherche]);

  useEffect(() => {
    charger();
  }, [charger]);
  useRafraichirAuto(charger);

  const totalPages = Math.max(1, Math.ceil(total / lignesParPage));

  return (
    <div>
      <header className="entete-page">
        <div>
          <h1>{titre}</h1>
          <p>{sousTitre}</p>
        </div>
      </header>

      <div className="filtres">
        <div className="recherche">
          <Search size={16} className="icone-recherche" />
          <input
            type="text"
            placeholder={placeholderRecherche}
            value={recherche}
            onChange={(e) => {
              setRecherche(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {erreur && <p className="erreur" style={{ marginBottom: 12 }}>{erreur}</p>}

      <section className="panel">
        {chargement ? (
          <div className="etat-vide" style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center" }}>
            <Loader2 size={18} /> Chargement…
          </div>
        ) : lignes.length === 0 ? (
          <p className="etat-vide">Aucun résultat.</p>
        ) : (
          <div className="tableau-conteneur">
            <table>
              <thead>
                <tr>{colonnes.map((c) => <th key={c.etiquette}>{c.etiquette}</th>)}</tr>
              </thead>
              <tbody>
                {lignes.map((l) => (
                  <tr key={l.id}>{colonnes.map((c) => <td key={c.etiquette}>{c.render(l)}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!chargement && lignes.length > 0 && (
          <div className="pagination">
            <span>{total} élément{total > 1 ? "s" : ""} — page {page} sur {totalPages}</span>
            <div className="boutons">
              <button className="bouton petit fantome" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Précédent</button>
              <button className="bouton petit fantome" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>Suivant</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
