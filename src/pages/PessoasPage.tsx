import { useEffect, useMemo, useState } from "react";
import { del, endpoints, get, post } from "../services/api";
import type { Pessoa } from "../types";

export default function PessoasPage() {
  // Estados de controle geral da tela
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Lista de pessoas carregadas do back-end
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);

  // Estados do formulário de criação
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState<number>(18);

  // Busca todas as pessoas no back-end
  async function carregar() {
    setLoading(true);
    setErro(null);
    try {
      const data = await get<Pessoa[]>(endpoints.pessoas);
      setPessoas(data);
    } catch (e: any) {
      setErro(e.message || "Erro ao carregar pessoas");
    } finally {
      setLoading(false);
    }
  }

  // Carrega a listagem assim que a página abre
  useEffect(() => {
    carregar();
  }, []);

  // Validação do formulário conforme regra do teste (idade: inteiro positivo)
  const podeSalvar = useMemo(() => {
    if (!nome.trim()) return false;
    if (!Number.isInteger(idade)) return false;
    if (idade <= 0) return false;
    return true;
  }, [nome, idade]);

  // Cria uma pessoa e recarrega a listagem
  async function criar() {
    if (!podeSalvar) return;

    setLoading(true);
    setErro(null);
    try {
      await post<Pessoa>(endpoints.pessoas, { nome: nome.trim(), idade });

      // Reseta o formulário após salvar
      setNome("");
      setIdade(18);

      await carregar();
    } catch (e: any) {
      setErro(e.message || "Erro ao criar pessoa");
    } finally {
      setLoading(false);
    }
  }

  // Deleta uma pessoa (regra importante: o back remove também as transações dela)
  async function remover(id: number) {
    const ok = confirm("Tem certeza que deseja deletar essa pessoa?");
    if (!ok) return;

    setLoading(true);
    setErro(null);
    try {
      await del(endpoints.pessoaById(id));
      await carregar();
    } catch (e: any) {
      setErro(e.message || "Erro ao deletar pessoa");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Pessoas</h1>

      <div className="card">
        <h2>Criar pessoa</h2>

        <div className="grid">
          <label>
            Nome
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: João"
            />
          </label>

          <label>
            Idade (inteiro positivo)
            <input
              type="number"
              value={idade}
              onChange={(e) => setIdade(Number(e.target.value))}
              min={1}
              step={1}
            />
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
              <th>Nome</th>
              <th>Idade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pessoas.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nome}</td>
                <td>{p.idade}</td>
                <td>
                  <button
                    className="danger"
                    onClick={() => remover(p.id)}
                    disabled={loading}
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}

            {pessoas.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="muted">
                  Nenhuma pessoa cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
