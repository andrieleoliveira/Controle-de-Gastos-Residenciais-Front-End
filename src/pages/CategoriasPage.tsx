import { useEffect, useMemo, useState } from "react";
import { endpoints, get, post } from "../services/api";
import type { Categoria, FinalidadeCategoria } from "../types";

export default function CategoriasPage() {
  // Estados de controle geral da tela
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Lista de categorias carregadas da API
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Estados do formulário de criação
  const [descricao, setDescricao] = useState("");
  const [finalidade, setFinalidade] = useState<FinalidadeCategoria>("ambas");

  // Busca todas as categorias no back-end
  async function carregar() {
    setLoading(true);
    setErro(null);
    try {
      const data = await get<Categoria[]>(endpoints.categorias);
      setCategorias(data);
    } catch (e: any) {
      setErro(e.message || "Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  }

  // Carrega as categorias assim que a página é montada
  useEffect(() => {
    carregar();
  }, []);

  // Validação simples para evitar salvar descrição vazia
  const podeSalvar = useMemo(() => descricao.trim().length > 0, [descricao]);

  // Cria uma nova categoria e recarrega a listagem
  async function criar() {
    if (!podeSalvar) return;

    setLoading(true);
    setErro(null);
    try {
      await post<Categoria>(endpoints.categorias, {
        descricao: descricao.trim(),
        finalidade,
      });

      // Reseta o formulário após salvar
      setDescricao("");
      setFinalidade("ambas");

      await carregar();
    } catch (e: any) {
      setErro(e.message || "Erro ao criar categoria");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Categorias</h1>

      <div className="card">
        <h2>Criar categoria</h2>

        <div className="grid">
          <label>
            Descrição
            <input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Alimentação"
            />
          </label>

          <label>
            Finalidade
            <select
              value={finalidade}
              onChange={(e) =>
                setFinalidade(e.target.value as FinalidadeCategoria)
              }
            >
              <option value="despesa">despesa</option>
              <option value="receita">receita</option>
              <option value="ambas">ambas</option>
            </select>
          </label>

          <button disabled={!podeSalvar || loading} onClick={criar}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>

        {erro && <p className="error">{erro}</p>}
      </div>

      <div className="card">
        <h2>Listagem</h2>

        <button onClick={carregar} disabled={loading}>
          Recarregar
        </button>

        {loading && <p className="muted">Carregando...</p>}

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Descrição</th>
              <th>Finalidade</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.descricao}</td>
                <td>{c.finalidade}</td>
              </tr>
            ))}

            {categorias.length === 0 && !loading && (
              <tr>
                <td colSpan={3} className="muted">
                  Nenhuma categoria cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
