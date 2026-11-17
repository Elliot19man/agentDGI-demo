import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

/**
 * Erreurs réseau (CORS bloqué, API injoignable, timeout) ne portent pas de
 * réponse : le message de repli technique « Identifiants incorrects » serait
 * trompeur. On distingue donc les deux cas pour que l'agent sache quoi faire.
 */
function messageErreur(err: any, repli: string): string {
  if (err?.response) {
    return err.response.data?.message || repli;
  }
  if (err?.code === "ECONNABORTED") {
    return "Le serveur met trop de temps à répondre. Réessayez dans un instant.";
  }
  return "Le serveur est injoignable. Vérifiez la connexion, ou réessayez dans un instant.";
}

export default function Login() {
  const [etape, setEtape] = useState<"login" | "otp">("login");
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [voirMotDePasse, setVoirMotDePasse] = useState(false);
  const [code, setCode] = useState("");
  const [jetonOtp, setJetonOtp] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const navigate = useNavigate();
  const { connecter } = useAuth();

  async function seConnecter(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setChargement(true);
    try {
      const { data } = await api.post("/auth/connexion", {
        identifiant,
        motDePasse,
      });
      if (data.etape === "AUTHENTIFIE") {
        if (data.utilisateur.role !== "AGENT_DGI") {
          setErreur("Cette interface est réservée aux agents DGI.");
          return;
        }
        connecter(data.utilisateur, data.accessToken);
        navigate("/");
        return;
      }
      setJetonOtp(data.jeton);
      setEtape("otp");
    } catch (err: any) {
      setErreur(messageErreur(err, "Identifiants incorrects."));
    } finally {
      setChargement(false);
    }
  }

  async function verifierCode(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setChargement(true);
    try {
      const { data } = await api.post("/auth/verification-otp", {
        jeton: jetonOtp,
        code,
      });
      if (data.utilisateur.role !== "AGENT_DGI") {
        setErreur("Cette interface est réservée aux agents DGI.");
        return;
      }
      connecter(data.utilisateur, data.accessToken);
      navigate("/");
    } catch (err: any) {
      setErreur(messageErreur(err, "Code invalide ou expiré."));
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="conteneur-login">
      <div className="login-visuel">
        <div className="marque">
          <div className="pastille">
            <svg viewBox="0 0 24 24" fill="none" width="19" height="19">
              <path d="M4 5h16M4 12h16M4 19h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="nom">
            ISRAS — DGI
            <small>Espace agent</small>
          </div>
        </div>
        <div className="login-slogan">
          <h1>Le dossier fiscal, en un regard.</h1>
          <p>
            Validation des avis de débit et des récépissés, suivi des
            immatriculations et des déclarations des contribuables inscrits.
          </p>
        </div>
        <div />
      </div>

      <div className="login-carte">
        <form className="carte-login" onSubmit={etape === "login" ? seConnecter : verifierCode}>
          <h2>{etape === "login" ? "Connexion agent" : "Vérification"}</h2>
          <p className="sous-titre">
            {etape === "login"
              ? "Direction Générale des Impôts — accès réservé aux agents."
              : "Un code à 6 chiffres vous a été envoyé par e-mail."}
          </p>

          {etape === "login" ? (
            <>
              <input
                className="champ"
                type="text"
                placeholder="Identifiant"
                autoComplete="username"
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                required
              />
              <div className="champ-secret">
                <input
                  className="champ"
                  type={voirMotDePasse ? "text" : "password"}
                  placeholder="Mot de passe"
                  autoComplete="current-password"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="bascule-mdp"
                  aria-label={voirMotDePasse ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  aria-pressed={voirMotDePasse}
                  title={voirMotDePasse ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  onClick={() => setVoirMotDePasse((v) => !v)}
                >
                  {voirMotDePasse ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </>
          ) : (
            <input
              className="champ"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Code à 6 chiffres"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
            />
          )}

          {erreur && <p className="erreur">{erreur}</p>}

          <button className="bouton" disabled={chargement}>
            {chargement ? (
              <Loader2 size={16} className="spin" />
            ) : etape === "login" ? (
              "Se connecter"
            ) : (
              "Valider le code"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
