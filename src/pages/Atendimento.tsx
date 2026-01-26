import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundDither from "@/components/BackgroundDither";

import Home from "@/pages/Home";
import Denuncias from "@/pages/Denuncias";

import Questionario from "@/pages/Questionario";
import Atendimento from "@/pages/Atendimento";
import CadastroTerreiro from "@/pages/CadastroTerreiro";

export default function App() {
  return (
    <div className="relative min-h-screen">
      <BackgroundDither />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Fluxo */}
            <Route path="/questionario" element={<Questionario />} />
            <Route path="/atendimento" element={<Atendimento />} />
            <Route path="/cadastro-terreiro" element={<CadastroTerreiro />} />

            {/* Outros */}
            <Route path="/denuncias" element={<Denuncias />} />

            {/* Se você ainda usa essas páginas antigas, mantenha. Se não, remova. */}
            {/* <Route path="/cadastro" element={<Cadastro />} /> */}
            {/* <Route path="/detalhes/:id" element={<Detalhes />} /> */}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </div>
  );
}
