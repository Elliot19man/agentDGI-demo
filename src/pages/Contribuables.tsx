import { useCallback, useEffect, useState } from "react";
import { Search, Loader2, Building2, ListTree, X } from "lucide-react";
import { api } from "../api/client";
import { useRafraichirAuto } from "../hooks/useRafraichirAuto";
import { formatMontant, formatDate } from "../utils";

interface ContribuableLite {
  id: number;
  nif: string;
  raisonSociale: string;
  adresse: string | null;
  fournisseurs: number;
  declarations: number;
  retenue: number;
}

interface FournisseurDetail {
  id: number;
  nom: string;
  prenoms: string;
  nif: string | null;
  dateImmatriculation: string | null;
  centreFiscal: string | null;
  secteurActivite: string | null;
  producteurDeBase: boolean;
  dateImmatriculationDossier: string | null;
}

interface Detail {
  contribuable: { id: number; nif: string; raisonSociale: string; adresse: string | null };
  immatriculations: number;
  declarations: number;
  retenueTotale: number;
  fournisseurs: FournisseurDetail[];
}

export default function Contribuables() {
  const [recherche, setRecherche] = useState("");
  const [termes, setTermes] = useState("");
  const [lignes, setLignes] = useState<ContribuableLite[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [chargementDetail, setChargementDetail] = useState(false);

  const limite = 20;

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur("");
    try {
      const params = new URLSearchParams({ page: String(page), limite: String(limite) });
      if (termes) params.set("recherche", termes);
      const { data } = await api.get(`/agent/contribuables?${params.toString()}`);
      setLignes(data.contribuables ?? []);
      setTotal(data.total ?? 0);
    } catch (err: any) {
      setErreur(err.response?.data?.message || "Erreur de chargement");
    } finally {
      setChargement(false);
    }
  }, [page, termes]);

  useEffect(() => {
    const minuteur = setTimeout(() => setTermes(recherche), 350);
    return () => clearTimeout(minuteur);
  }, [recherche]);

  useEffect(() => {
    charger();
  }, [charger]);
  useRafraichirAuto(charger);

  async function ouvrirDetail(id: number) {
    setDetailId(id);
    setDetail(null);
    setChargementDetail(true);
    try {
      const { data } = await api.get(`/agent/contribuables/${id}`);
      setDetail(data as Detail);
    } catch (err: any) {
      setErreur(err.response?.data?.message || "Erreur de chargement du détail");
    } finally {
      setChargementDetail(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limite));

  return (
    <div>
      <header className="entete-page">
        <div>
          <h1>CCI &amp; fournisseurs</h1>
          <p>Liste des contribuables clients immatriculés et de leurs fournisseurs</p>
        </div>
      </header>

      <div className="filtres">
        <div className="recherche">
          <Search size={16} className="icone-recherche" />
          <input
            type="text"
            placeholder="Rechercher un CCI par raison sociale ou NIF…"
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
          <p className="etat-vide">Aucun CCI trouvé.</p>
        ) : (
          <div className="tableau-conteneur">
            <table>
              <thead>
                <tr>
                  <th>CCI</th>
                  <th>Fournisseurs</th>
                  <th>Déclarations</th>
                  <th>Retenue totale</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="cellule-principale">{c.raisonSociale}</div>
                      <div className="cellule-secondaire">NIF {c.nif}{c.adresse ? ` · ${c.adresse}` : ""}</div>
                    </td>
                    <td>{c.fournisseurs}</td>
                    <td>{c.declarations}</td>
                    <td>{formatMontant(c.retenue)}</td>
                    <td>
                      <button className="bouton petit fantome" onClick={() => ouvrirDetail(c.id)}>
                        <ListTree size={13} style={{ verticalAlign: "-1px" }} /> Détail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!chargement && lignes.length > 0 && (
          <div className="pagination">
            <span>{total} CCI — page {page} sur {totalPages}</span>
            <div className="boutons">
              <button className="bouton petit fantome" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Précédent</button>
              <button className="bouton petit fantome" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>Suivant</button>
            </div>
          </div>
        )}
      </section>

      {detailId !== null && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ position: "fixed", inset: 0, background: "rgba(23,35,30,.45)", zIndex: 40, display: "flex", justifyContent: "flex-end" }}
          onClick={() => setDetailId(null)}
        >
          <div
            className="panel"
            style={{ width: "min(640px, 100%)", height: "100%", overflowY: "auto", borderRadius: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="panel-titre">
              <h2>Détail du CCI</h2>
              <button className="bouton fantome petit" onClick={() => setDetailId(null)} aria-label="Fermer">
                <X size={16} />
              </button>
            </div>
            {chargementDetail ? (
              <div className="etat-vide" style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center" }}>
                <Loader2 size={18} /> Chargement…
              </div>
            ) : detail ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <span className="activite-icone quittance" style={{ width: 44, height: 44, borderRadius: 12 }}>
                    <Building2 size={20} />
                  </span>
                  <div>
                    <div className="cellule-principale" style={{ fontSize: 16 }}>{detail.contribuable.raisonSociale}</div>
                    <div className="cellule-secondaire">NIF {detail.contribuable.nif}{detail.contribuable.adresse ? ` · ${detail.contribuable.adresse}` : ""}</div>
                  </div>
                </div>

                <div className="grille-kpis" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 20 }}>
                  <div className="kpi"><div className="etiquette">Fournisseurs</div><div className="valeur" style={{ fontSize: 22 }}>{detail.fournisseurs.length}</div></div>
                  <div className="kpi"><div className="etiquette">Déclarations</div><div className="valeur" style={{ fontSize: 22 }}>{detail.declarations}</div></div>
                  <div className="kpi"><div className="etiquette">Retenue totale</div><div className="valeur" style={{ fontSize: 18 }}>{formatMontant(detail.retenueTotale)}</div></div>
                </div>

                <div className="panel-titre"><h2>Fournisseurs ({detail.fournisseurs.length})</h2></div>
                {detail.fournisseurs.length === 0 ? (
                  <p className="etat-vide">Aucun fournisseur immatriculé pour ce CCI.</p>
                ) : (
                  <div className="tableau-conteneur">
                    <table>
                      <thead>
                        <tr>
                          <th>Fournisseur</th>
                          <th>NIF</th>
                          <th>Centre</th>
                          <th>Immatriculé</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.fournisseurs.map((f) => (
                          <tr key={f.id}>
                            <td>
                              <div className="cellule-principale">{f.nom} {f.prenoms}</div>
                              <div className="cellule-secondaire">{f.secteurActivite ?? "—"}{f.producteurDeBase ? " · Producteur de base" : ""}</div>
                            </td>
                            <td style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>{f.nif ?? "—"}</td>
                            <td>{f.centreFiscal ?? "—"}</td>
                            <td>{formatDate(f.dateImmatriculation)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <p className="etat-vide">Détail indisponible.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
