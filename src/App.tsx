import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import VueEnsemble from "./pages/VueEnsemble";
import Validations from "./pages/Validations";
import Contribuables from "./pages/Contribuables";
import Immatriculations from "./pages/Immatriculations";
import Declarations from "./pages/Declarations";

function RouteProtegee({ children }: { children: React.ReactNode }) {
  const { utilisateur } = useAuth();
  if (!utilisateur) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <RouteProtegee>
                <Layout />
              </RouteProtegee>
            }
          >
            <Route path="/" element={<VueEnsemble />} />
            <Route path="/validations" element={<Validations />} />
            <Route path="/contribuables" element={<Contribuables />} />
            <Route path="/immatriculations" element={<Immatriculations />} />
            <Route path="/declarations" element={<Declarations />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
