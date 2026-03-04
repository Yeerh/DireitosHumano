import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Footer from "@/components/Footer";
import Denuncias from "@/pages/Denuncias";
import Home from "@/pages/Home";
import Cadastro from "@/pages/Cadastro";
import Detalhes from "@/pages/Detalhes";
import Login from "@/pages/Login";

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/cadastro" element={<Cadastro />} />
          </Route>
          <Route path="/denuncias" element={<Denuncias />} />
          <Route path="/detalhes/:id" element={<Detalhes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
