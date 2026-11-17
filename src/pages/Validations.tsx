import { useCallback, useEffect, useState } from "react";
import {
  Inbox,
  BadgeCheck,
  XCircle,
  Loader2,
  Check,
} from "lucide-react";
import { api } from "../api/client";
import { useRafraichirAuto } from "../hooks/useRafraichirAuto";
import { formatMontant } from "../utils";

interface AvisEnAttente {
  id: number;
  reference: string;
  operation: string;
  mode: string;
  montantTotal: number;
  referenceAvisDebit: string | null;
  dateExecution: string | null;
  centreFiscal: { code: string; nom: string } | null;
  contribuable: { id: number; raisonSociale: string; nif: string } | null;
}

interface QuittanceEnAttente {
  id: number;
  referenceQuittance: string;
  saisieLe: string;
  avisCredit?: string | null;
  dateAvisCredit?: string | null;
  statut: string;
  motifRejet?: string | null;
  paiement: {
    id: number;
    reference: string;
    mode: string;
    montantTotal: number;
    referenceAvisDebit: string | null;
    dateExecution: string | null;
    centreFiscal: { code: string; nom: string } | null;
  };
  contribuable: { nif: string; raisonSociale: string };
}

export default function Validations() {
  const [onglet, setOnglet] = useState<"avis" | "quittances">("avis");
  const [avis, setAvis] = useState<AvisEnAttente[]>([]);
  const [quittances, setQuittances] = useState<QuittanceEnAttente[]>([]);
  const [chargement, setChargement] = useState(true);
  const [actionEnCours, setActionEnCours] = useState<number | null>(null);
  const [erreur, setErreur] = useState("");

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur("");
    try {
      const [reponseAvis, reponseQuittances] = await Promise.all([
        api.get("/paiements/en-attente-avis"),
        api.get("/agent/quittances?statut=EN_ATTENTE&limite=100"),
      ]);
      setAvis(reponseAvis.data?.paiements ?? []);
      setQuittances(reponseQuittances.data?.quittances ?? []);
    } catch (err: any) {
      setErreur(err.response?.data?.message || "Erreur de chargement");
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);
  useRafraichirAuto(charger);

  async function validerAvis(id: number) {
    setActionEnCours(id);
    setErreur("");
    try {
      await api.post(`/paiements/${id}/valider-avis`);
      await charger();
    } catch (err: any) {
      setErreur(err.response?.data?.message || "Erreur");
    } finally {
      setActionEnCours(null);
    }
  }

  async function validerQuittance(id: number) {
    setActionEnCours(id);
    setErreur("");
    try {
      await api.post(`/agent/quittances/${id}/valider`);
      await charger();
    } catch (err: any) {
      setErreur(err.response?.data?.message || "Erreur");
    } finally {
      setActionEnCours(null);
    }
  }

  async function rejeterQuittance(id: number) {
    const motif = window.prompt("Motif du rejet (obligatoire) :");
    if (motif === null) return;
    if (motif.trim().length < 5) {
      setErreur("Le motif doit contenir au moins 5 caractères.");
      return;
    }
    setActionEnCours(id);
    setErreur("");
    try {
      await api.post(`/agent/quittances/${id}/rejeter`, { motif: motif.trim() });
      await charger();
    } catch (err: any) {
      setErreur(err.response?.data?.message || "Erreur");
    } finally {
      setActionEnCours(null);
    }
  }

  return (
    <div>
      <header className="entete-page">
        <div>
          <h1>Validations</h1>
          <p>Comparaison des références du CCI avec les documents bancaires</p>
        </div>
        <button className="bouton petit fantome" onClick={charger} disabled={chargement}>
          Actualiser
        </button>
      </header>

      <div className="filtres" role="tablist">
        <button
          className={`bouton petit ${onglet === "avis" ? "" : "fantome"}`}
          onClick={() => setOnglet("avis")}
        >
          <Inbox size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          Avis de débit ({avis.length})
        </button>
        <button
          className={`bouton petit ${onglet === "quittances" ? "" : "fantome"}`}
          onClick={() => setOnglet("quittances")}
        >
          <BadgeCheck size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          Récépissés ({quittances.length})
        </button>
      </div>

      {erreur && <p className="erreur" style={{ marginBottom: 12 }}>{erreur}</p>}

      {chargement ? (
        <div className="panel etat-vide" style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center" }}>
          <Loader2 size={18} /> Chargement…
        </div>
      ) : onglet === "avis" ? (
        <section className="panel">
          <div className="panel-titre"><h2>Avis de débit en attente de validation</h2></div>
          {avis.length === 0 ? (
            <p className="etat-vide">Aucun avis de débit en attente.</p>
          ) : (
            <div className="tableau-conteneur">
              <table>
                <thead>
                  <tr>
                    <th>CCI</th>
                    <th>Centre</th>
                    <th>Référence saisie</th>
                    <th>Montant</th>
                    <th>Exécution</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {avis.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="cellule-principale">{p.contribuable?.raisonSociale ?? "—"}</div>
                        <div className="cellule-secondaire">NIF {p.contribuable?.nif ?? "—"}</div>
                      </td>
                      <td>{p.centreFiscal?.nom ?? "—"}</td>
                      <td className="cellule-principale" style={{ fontFamily: "ui-monospace, monospace", fontSize: 12.5 }}>
                        {p.referenceAvisDebit}
                      </td>
                      <td>{formatMontant(p.montantTotal)}</td>
                      <td>{p.dateExecution ?? "—"}</td>
                      <td>
                        <button className="bouton petit vert" onClick={() => validerAvis(p.id)} disabled={actionEnCours === p.id}>
                          {actionEnCours === p.id ? "…" : "Valider"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : (
        <section className="panel">
          <div className="panel-titre"><h2>Récépissés en attente de validation</h2></div>
          {quittances.length === 0 ? (
            <p className="etat-vide">Aucun récépissé en attente.</p>
          ) : (
            <div className="tableau-conteneur">
              <table>
                <thead>
                  <tr>
                    <th>CCI</th>
                    <th>Référence récépissé</th>
                    <th>Montant</th>
                    <th>Avis de débit</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {quittances.map((q) => (
                    <tr key={q.id}>
                      <td>
                        <div className="cellule-principale">{q.contribuable?.raisonSociale ?? "—"}</div>
                        <div className="cellule-secondaire">NIF {q.contribuable?.nif ?? "—"}</div>
                      </td>
                      <td className="cellule-principale" style={{ fontFamily: "ui-monospace, monospace", fontSize: 12.5 }}>
                        {q.referenceQuittance}
                      </td>
                      <td>{formatMontant(q.paiement.montantTotal)}</td>
                      <td>{q.paiement.referenceAvisDebit ?? "—"}</td>
                      <td>
                        <div className="actions">
                          <button className="bouton petit vert" onClick={() => validerQuittance(q.id)} disabled={actionEnCours === q.id}>
                            <Check size={13} style={{ verticalAlign: "-1px" }} /> {actionEnCours === q.id ? "…" : "Valider"}
                          </button>
                          <button className="bouton petit rouge" onClick={() => rejeterQuittance(q.id)} disabled={actionEnCours === q.id}>
                            <XCircle size={13} style={{ verticalAlign: "-1px" }} /> Rejeter
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
