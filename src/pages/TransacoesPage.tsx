import { useEffect, useMemo, useState } from "react";
import { endpoints, get, post } from "../services/api";
import type { Categoria, Pessoa, TipoTransacao, Transacao } from "../types";

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Regras de negócio (front):
 * 1) Menor de idade (<18): apenas transações do tipo "despesa" são aceitas.
 * 2) Finalidade da categoria restringe o tipo:
 *    - tipo "despesa" só pode usar categoria finalidade "despesa" ou "ambas"
 *    - tipo "receita" só pode usar categoria finalidade "receita" ou "ambas"
 *
 * Observação importante:
 * O back-end deve validar essas regras também.
 * O front valida para melhorar UX (feedback rápido).
 */
export default function TransacoesPage() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);

  // form
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState<number>(0);
  const [tipo, setTipo] = useState<TipoTransacao>("despesa");
  const [pessoaId, setPessoaId] = useState<number | "">("");
  const [categoriaId, setCategoriaId] = useState<number | "">("");

  async function carregarBase() {
    setLoading(true);
    setErro(null);
    try {
      const [ps, cs, ts] = await Promise.all([
        get<Pessoa[]>(endpoints.pessoas),
        get<Categoria[]>(endpoints.categorias),
        get<Transacao[]>(endpoints.transacoes),
      ]);
      setPessoas(ps);
      setCategorias(cs);
      setTransacoes(ts);
    } catch (e: any) {
      setErro(e.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarBase();
  }, []);

  const pessoaSelecionada = useMemo(
    () => pessoas.find((p) => p.id === pessoaId) || null,
    [pessoas, pessoaId]
  );

  const categoriasPermitidas = useMemo(() => {
    return categorias.filter((c) => {
      if (tipo === "despesa") return c.finalidade === "despesa" || c.finalidade === "ambas";
      return c.finalidade === "receita" || c.finalidade === "ambas";
    });
  }, [categorias, tipo]);

  // Se mudar tipo, reseta categoria se ela não for mais permitida
  useEffect(() => {
    if (categoriaId === "") return;
    const ok = categoriasPermitidas.some((c) => c.id === categoriaId);
    if (!ok) setCategoriaId("");
  }, [tipo, categoriasPermitidas, categoriaId]);

  const regraMenorIdadeBloqueiaReceita = useMemo(() => {
    if (!pessoaSelecionada) return false;
    return pessoaSelecionada.idade < 18 && tipo === "receita";
  }, [pessoaSelecionada, tipo]);

  const podeSalvar = useMemo(() => {
    if (!descricao.trim()) return false;
    if (valor <= 0) return false;
    if (pessoaId === "" || categoriaId === "") return false;

    // regra menor de idade:
    if (regraMenorIdadeBloqueiaReceita) return false;

    // regra categoria:
    const cat = categorias.find((c) => c.id === categoriaId);
    if (!cat) return false;

    if (tipo === "despesa" && !(cat.finalidade === "despesa" || cat.finalidade === "ambas")) return false;
    if (tipo === "receita" && !(cat.finalidade === "receita" || cat.finalidade === "ambas")) return false;

    return true;
  }, [descricao, valor, pessoaId, categoriaId, regraMenorIdadeBloqueiaReceita, categorias, tipo]);

  async function criar() {
    if (!podeSalvar) return;
    setLoading(true);
    setErro(null);
    try {
      await post<Transacao>(endpoints.transacoes, {
        descricao: descricao.trim(),
        valor,
        tipo,
        pessoaId,
        categoriaId,
      });

      setDescricao("");
      setValor(0);
      setTipo("despesa");
      setPessoaId("");
      setCategoriaId("");

      await carregarBase();
    } catch (e: any) {
      setErro(e.message || "Erro ao criar transação");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Transações</h1>

      <div className="card">
        <h2>Criar transação</h2>

        <div className="grid">
          <label>
            Pessoa
            <select value={pessoaId} onChange={(e) => setPessoaId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Selecione</option>
              {pessoas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({p.idade} anos)
                </option>
              ))}
            </select>
          </label>

          <label>
            Tipo
            <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoTransacao)}>
              <option value="despesa">despesa</option>
              <option value="receita">receita</option>
            </select>
          </label>

          <label>
            Categoria (filtrada por finalidade)
            <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Selecione</option>
              {categoriasPermitidas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.descricao} ({c.finalidade})
                </option>
              ))}
            </select>
          </label>

          <label>
            Descrição
            <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Mercado" />
          </label>

          <label>
            Valor (decimal positivo)
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(Number(e.target.value))}
              min={0}
              step="0.01"
            />
          </label>

          <button disabled={!podeSalvar || loading} onClick={criar}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>

        {pessoaSelecionada && pessoaSelecionada.idade < 18 && (
          <p className="warn">
            Pessoa menor de 18: o sistema bloqueia transação do tipo <b>receita</b> (somente despesas).
          </p>
        )}

        {erro && <p className="error">{erro}</p>}
      </div>

      <div className="card">
        <h2>Listagem</h2>

        <button onClick={carregarBase} disabled={loading}>
          Recarregar
        </button>

        {loading && <p className="muted">Carregando...</p>}

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Descrição</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Pessoa</th>
              <th>Categoria</th>
            </tr>
          </thead>
          <tbody>
            {transacoes.map((t) => {
              const p = pessoas.find((x) => x.id === t.pessoaId);
              const c = categorias.find((x) => x.id === t.categoriaId);
              return (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.descricao}</td>
                  <td>{t.tipo}</td>
                  <td>{formatMoney(t.valor)}</td>
                  <td>{t.pessoaNome ?? p?.nome ?? t.pessoaId}</td>
                  <td>{t.categoriaDescricao ?? c?.descricao ?? t.categoriaId}</td>
                </tr>
              );
            })}

            {transacoes.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="muted">
                  Nenhuma transação cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
