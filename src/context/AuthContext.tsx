import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  role: string;
}

interface AuthContextType {
  utilisateur: Utilisateur | null;
  connecter: (utilisateur: Utilisateur, token: string) => void;
  deconnecter: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(() => {
    const raw = localStorage.getItem("utilisateur");
    return raw ? JSON.parse(raw) : null;
  });

  function connecter(utilisateur: Utilisateur, token: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("utilisateur", JSON.stringify(utilisateur));
    setUtilisateur(utilisateur);
  }

  function deconnecter() {
    localStorage.clear();
    setUtilisateur(null);
  }

  return (
    <AuthContext.Provider value={{ utilisateur, connecter, deconnecter }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit etre utilise dans AuthProvider");
  return ctx;
}
