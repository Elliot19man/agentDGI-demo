import ListePaginee from "../components/ListePaginee";
import { formatDate } from "../utils";

interface Immatriculation {
  id: number;
  referenceAttestation: string;
  date: string;
  contribuable: { id: number; raisonSociale: string; nif: string };
  fournisseur: {
    id: number;
    nom: string;
    prenoms: string;
    nif: string | null;
    dateImmatriculation: string | null;
    centreFiscal: string | null;
    producteurDeBase: boolean;
  };
}

export default function Immatriculations() {
  return (
    <ListePaginee<Immatriculation>
      titre="Immatriculations"
      sousTitre="Historique des fournisseurs immatriculés par les CCI"
      endpoint="/agent/immatriculations"
      champListe="immatriculations"
      placeholderRecherche="Rechercher (CCI, NIF, référence…)"
      colonnes={[
        {
          etiquette: "CCI",
          render: (i) => (
            <>
              <div className="cellule-principale">{i.contribuable.raisonSociale}</div>
              <div className="cellule-secondaire">NIF {i.contribuable.nif}</div>
            </>
          ),
        },
        {
          etiquette: "Fournisseur",
          render: (i) => (
            <>
              <div className="cellule-principale">{i.fournisseur.nom} {i.fournisseur.prenoms}</div>
              <div className="cellule-secondaire">NIF {i.fournisseur.nif ?? "—"}</div>
            </>
          ),
        },
        {
          etiquette: "Centre",
          render: (i) => i.fournisseur.centreFiscal ?? "—",
        },
        {
          etiquette: "Référence",
          render: (i) => (
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>{i.referenceAttestation}</span>
          ),
        },
        {
          etiquette: "Date",
          render: (i) => formatDate(i.date),
        },
      ]}
    />
  );
}
