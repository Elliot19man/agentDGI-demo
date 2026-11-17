import ListePaginee from "../components/ListePaginee";
import { formatMontant, formatDate } from "../utils";

interface Declaration {
  id: number;
  reference: string;
  statut: "ENREGISTREE" | "PAYEE";
  dateDeclaration: string;
  dateLimite: string;
  montantImposable: number;
  tauxIsras: number;
  montantRetenue: number;
  contribuable: { id: number; raisonSociale: string; nif: string };
  fournisseur: { id: number; nom: string; prenoms: string; nif: string | null };
}

export default function Declarations() {
  return (
    <ListePaginee<Declaration>
      titre="Déclarations"
      sousTitre="Historique des déclarations déposées par les CCI"
      endpoint="/agent/declarations"
      champListe="declarations"
      placeholderRecherche="Rechercher (CCI, fournisseur, référence…)"
      colonnes={[
        {
          etiquette: "CCI",
          render: (d) => (
            <>
              <div className="cellule-principale">{d.contribuable.raisonSociale}</div>
              <div className="cellule-secondaire">NIF {d.contribuable.nif}</div>
            </>
          ),
        },
        {
          etiquette: "Fournisseur",
          render: (d) => (
            <>
              <div className="cellule-principale">{d.fournisseur.nom} {d.fournisseur.prenoms}</div>
              <div className="cellule-secondaire">NIF {d.fournisseur.nif ?? "—"}</div>
            </>
          ),
        },
        {
          etiquette: "Référence",
          render: (d) => (
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>{d.reference}</span>
          ),
        },
        {
          etiquette: "Retenue",
          render: (d) => formatMontant(d.montantRetenue),
        },
        {
          etiquette: "Statut",
          render: (d) => (
            <span className={`badge ${d.statut === "PAYEE" ? "payee" : "enregistree"}`}>
              {d.statut === "PAYEE" ? "Payée" : "Enregistrée"}
            </span>
          ),
        },
        {
          etiquette: "Échéance",
          render: (d) => formatDate(d.dateLimite),
        },
      ]}
    />
  );
}
