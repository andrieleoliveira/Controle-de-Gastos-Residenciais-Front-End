import { NavLink, Route, Routes } from "react-router-dom";
import PessoasPage from "./pages/PessoasPage";
import CategoriasPage from "./pages/CategoriasPage";
import TransacoesPage from "./pages/TransacoesPage";
import TotaisPorPessoaPage from "./pages/TotaisPorPessoaPage";
import TotaisPorCategoriaPage from "./pages/TotaisPorCategoriaPage";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Controle de Gastos</h2>

        <nav className="nav">
          <NavLink
            to="/"
            end
            className={({ isActive }: { isActive: boolean }) => (isActive ? "active" : "")}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/pessoas"
            className={({ isActive }: { isActive: boolean }) => (isActive ? "active" : "")}
          >
            Pessoas
          </NavLink>

          <NavLink
            to="/categorias"
            className={({ isActive }: { isActive: boolean }) => (isActive ? "active" : "")}
          >
            Categorias
          </NavLink>

          <NavLink
            to="/transacoes"
            className={({ isActive }: { isActive: boolean }) => (isActive ? "active" : "")}
          >
            Transações
          </NavLink>

          <NavLink
            to="/totais-por-pessoa"
            className={({ isActive }: { isActive: boolean }) => (isActive ? "active" : "")}
          >
            Totais por pessoa
          </NavLink>

          <NavLink
            to="/totais-por-categoria"
            className={({ isActive }: { isActive: boolean }) => (isActive ? "active" : "")}
          >
            Totais por categoria
          </NavLink>
        </nav>

      
      </aside>

      <main className="content">
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <h1>Dashboard</h1>
                <p>Use o menu para cadastrar pessoas, categorias e transações.</p>
              </div>
            }
          />
          <Route path="/pessoas" element={<PessoasPage />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/transacoes" element={<TransacoesPage />} />
          <Route path="/totais-por-pessoa" element={<TotaisPorPessoaPage />} />
          <Route path="/totais-por-categoria" element={<TotaisPorCategoriaPage />} />
        </Routes>
      </main>
    </div>
  );
}
