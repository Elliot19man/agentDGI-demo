import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  Building2,
  FileBadge2,
  FileText,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { utilisateur, deconnecter } = useAuth();
  const navigate = useNavigate();
  const initiales = `${utilisateur?.prenom?.[0] ?? ""}${utilisateur?.nom?.[0] ?? ""}`.toUpperCase();

  const items = [
    { to: "/", label: "Vue d'ensemble", Icon: LayoutDashboard },
    { to: "/validations", label: "Validations", Icon: ShieldCheck },
    { to: "/contribuables", label: "CCI & fournisseurs", Icon: Building2 },
    { to: "/immatriculations", label: "Immatriculations", Icon: FileBadge2 },
    { to: "/declarations", label: "Déclarations", Icon: FileText },
  ];

  return (
    <aside className="barre-laterale">
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

      <nav className="nav">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => (isActive ? "actif" : "")}
          >
            <span className="pastille-icone">
              <Icon size={16} strokeWidth={2} />
            </span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="agent-pied">
        <div className="agent-identite">
          <div className="avatar-inis">{initiales || "AG"}</div>
          <div>
            <div className="nom">
              {utilisateur?.prenom} {utilisateur?.nom}
            </div>
            <div className="role">Agent DGI</div>
          </div>
        </div>
        <button
          className="deconnexion"
          onClick={() => {
            deconnecter();
            navigate("/");
          }}
        >
          <LogOut size={16} />
          <span>Se déconnecter</span>
        </button>
      </div>
    </aside>
  );
}
