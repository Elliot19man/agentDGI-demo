import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Coins,
  ShieldAlert,
  Inbox,
  FileBadge2,
  BadgeCheck,
  Building2,
  Loader2,
} from "lucide-react";
import { api } from "../api/client";
import { useRafraichirAuto } from "../hooks/useRafraichirAuto";
import { formatMontant, formatDate, formatMois } from "../utils";

interface Activite {
  type: "immatriculation" | "declaration" | "quittance";
  reference: string;
  raisonSociale: string;
  date: string;
}

interface Mois {
  mois: string;
  declarations: number;
  retenue: number;
}

interface TableauDeBord {
  immatriculations: number;
  declarations: number;
  declarationsPayees: number;
  quittancesEnAttente: number;
  quittancesValidees: number;
  avisEnAttente: number;
  retenueTotale: number;
  dernieresActivites: Activite[];
  comptesParMois: Mois[];
}

const ICONE_ACTIVITE = {
  immatriculation: FileBadge2,
  declaration: FileText,
  quittance: BadgeCheck,
};

export default function VueEnsemble() {
  const [tableau, setTableau] = useState<TableauDeBord | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  const charger = useCallback(() => {
    api
      .get("/agent/tableau-de-bord")
      .then(({ data }) => setTableau(data as TableauDeBord))
      .catch((err) =>
        setErreur(err.response?.data?.message || "Erreur de chargement"),
      )
      .finally(() => setChargement(false));
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);
  useRafraichirAuto(charger);

  if (chargement) {
    return (
      <p className="etat-vide" style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
        <Loader2 size={18} className="spin" /> Chargement des données…
      </p>
    );
  }
  if (erreur || !tableau) {
    return <p className="erreur">{erreur || "Données indisponibles"}</p>;
  }

  const maxRetenue = Math.max(1, ...tableau.comptesParMois.map((m) => m.retenue));

  const kpis = [
    {
      etiquette: "Déclarations",
      valeur: String(tableau.declarations),
      detail: `${tableau.declarationsPayees} payées`,
      Icon: FileText,
    },
    {
      etiquette: "Retenue ISRAS encaissée",
      valeur: formatMontant(tableau.retenueTotale),
      detail: "Montant total déclaré",
      Icon: Coins,
    },
    {
      etiquette: "Récépissés en attente",
      valeur: String(tableau.quittancesEnAttente),
      detail: `${tableau.quittancesValidees} récépissés validés`,
      Icon: ShieldAlert,
    },
    {
      etiquette: "Avis de débit à valider",
      valeur: String(tableau.avisEnAttente),
      detail: "En attente de votre validation",
      Icon: Inbox,
    },
  ];

  return (
    <div>
      <header className="entete-page">
        <div>
          <h1>Vue d'ensemble</h1>
          <p>État de la plateforme ISRAS — validations et dossiers en cours</p>
        </div>
        <Link to="/validations" className="bouton petit" style={{ width: "auto", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
          <ShieldAlert size={16} />
          {tableau.quittancesEnAttente + tableau.avisEnAttente} validation{(tableau.quittancesEnAttente + tableau.avisEnAttente) > 1 ? "s" : ""} en attente
        </Link>
      </header>

      <section className="grille-kpis">
        {kpis.map(({ etiquette, valeur, detail, Icon }) => (
          <div className="kpi" key={etiquette}>
            <div className="etiquette">
              {etiquette}
              <span className="icone-kpi"><Icon size={16} /></span>
            </div>
            <div className="valeur">{valeur}</div>
            <div className="detail">{detail}</div>
          </div>
        ))}
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, alignItems: "start" }}>
        <section className="panel">
          <div className="panel-titre">
            <h2>Retenue ISRAS par mois</h2>
          </div>
          {tableau.comptesParMois.length === 0 ? (
            <p className="etat-vide">Aucune donnée sur les 6 derniers mois.</p>
          ) : (
            <>
              <div className="graphique">
                {tableau.comptesParMois.map((m) => (
                  <div className="colonne" key={m.mois} title={`${m.declarations} déclaration(s)`}>
                    <span className="total-mois">{m.retenue > 0 ? formatMontant(m.retenue) : "—"}</span>
                    <div
                      className={`barre ${m.retenue === 0 ? "vide" : ""}`}
                      style={{ height: `${(m.retenue / maxRetenue) * 120 + 10}px` }}
                    />
                    <span className="mois">{formatMois(m.mois)}</span>
                  </div>
                ))}
              </div>
              <p className="detail" style={{ marginTop: 12, color: "var(--discret)", fontSize: 12 }}>
                Retenue déclarée chaque mois, sur les 6 derniers mois.
              </p>
            </>
          )}
        </section>

        <aside className="panel">
          <div className="panel-titre">
            <h2>Activité récente</h2>
          </div>
          <div className="liste">
            {tableau.dernieresActivites.length === 0 && (
              <p className="etat-vide">Aucune activité pour le moment.</p>
            )}
            {tableau.dernieresActivites.map((a, i) => {
              const Icon = ICONE_ACTIVITE[a.type] ?? FileText;
              return (
                <div className="ligne-activite" key={`${a.reference}-${i}`}>
                  <span className={`activite-icone ${a.type}`}>
                    <Icon size={15} />
                  </span>
                  <div className="activite-contenu">
                    <div className="activite-titre">{a.reference}</div>
                    <div className="activite-sous">{a.raisonSociale}</div>
                  </div>
                  <span className="activite-date">{formatDate(a.date)}</span>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      <p style={{ color: "var(--discret)", fontSize: 12, marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <Building2 size={13} />
        {tableau.immatriculations} fournisseur{tableau.immatriculations > 1 ? "s" : ""} immatriculé{tableau.immatriculations > 1 ? "s" : ""} sur la plateforme.
      </p>
    </div>
  );
}
