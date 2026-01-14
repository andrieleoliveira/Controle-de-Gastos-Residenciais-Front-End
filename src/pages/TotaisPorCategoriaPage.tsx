import { useEffect, useState } from "react";
import { endpoints, get } from "../services/api";

type TotaisCategoriaItem = {
  categoriaId?: number;
  categoriaDescricao?: string;
  totalReceitas?: number;
  totalDespesas?: number;
  saldo?: number;

  id?: number;
  descricao?: string;
  receitas?: number;
  despesas?: number;
};

type TotaisCategoriaResponse =
  | {
      itens: TotaisCategoriaItem[];
      totalGeralReceitas?: number;
      totalGeralDespesas?: number;
      saldoGeral?: number;
    }
  | TotaisCategoriaItem[];

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function TotaisPorCategoriaPage() {
  // Estados de controle geral da tela
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Estado normalizado para renderização (independente do formato que o back retornar)
  const [itens, setItens] = useState<TotaisCategoriaItem[]>([]);

  // Totais gerais (uso cálculo local como fallback caso o back não retorne total geral)
  const [totReceitas, setTotReceitas] = useState(0);
  const [totDespesas, setTotDespesas] = useState(0);
  const [totSaldo, setTotSaldo] = useState(0);

  // Carrega o relatório de totais por categoria
  // Obs: deixei o front resiliente a formatos diferentes (lista direta ou objeto com "itens")
  async function carregar() {
    setLoading(true);
    setErro(null);

    try {
      const res = await get<TotaisCategoriaResponse>(endpoints.relTotaisPorCategoria);

      const list = Array.isArray(res) ? res : res.itens;

      // Normalização: garante um único formato para a UI, mesmo que o back use nomes diferentes
      const normalized = (list ?? []).map((x) => ({
        categoriaId: x.categoriaId ?? x.id ?? 0,
        categoriaDescricao: x.categoriaDescricao ?? x.descricao ?? "-",
        totalReceitas: x.totalReceitas ?? x.receitas ?? 0,
        totalDespesas: x.totalDespesas ?? x.despesas ?? 0,
        saldo:
          x.saldo ??
          (x.totalReceitas ?? x.receitas ?? 0) - (x.totalDespesas ?? x.despesas ?? 0),
      }));

      setItens(normalized);

      // Se o back devolver total geral pronto, eu uso.
      // Caso contrário, calculo aqui a partir dos itens.
      if (!Array.isArray(res) && res.totalGeralReceitas != null) {
        setTotReceitas(res.totalGeralReceitas ?? 0);
        setTotDespesas(res.totalGeralDespesas ?? 0);
        setTotSaldo(res.saldoGeral ?? 0);
      } else {
        const tr = normalized.reduce((a, b) => a + (b.totalReceitas ?? 0), 0);
        const td = normalized.reduce((a, b) => a + (b.totalDespesas ?? 0), 0);
        setTotReceitas(tr);
        setTotDespesas(td);
        setTotSaldo(tr - td);
      }
    } catch (e: any) {
      setErro(e.message || "Erro ao carregar totais por categoria");
    } finally {
      setLoading(false);
    }
  }

  // Carrega automaticamente ao entrar na página
  useEffect(() => {
    carregar();
  }, []);

  return (
    <div>
      <h1>Totais por categoria</h1>

      <div className="card">
        <button onClick={carregar} disabled={loading}>
          Recarregar
        </button>

        {loading && <p className="muted">Carregando...</p>}
        {erro && <p className="error">{erro}</p>}

        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Total receitas</th>
              <th>Total despesas</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((i) => (
              <tr key={i.categoriaId}>
                <td>{i.categoriaDescricao}</td>
                <td>{money(i.totalReceitas ?? 0)}</td>
                <td>{money(i.totalDespesas ?? 0)}</td>
                <td>{money(i.saldo ?? 0)}</td>
              </tr>
            ))}

            {itens.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="muted">
                  Sem dados.
                </td>
              </tr>
            )}
          </tbody>

          <tfoot>
            <tr>
              <th>Total geral</th>
              <th>{money(totReceitas)}</th>
              <th>{money(totDespesas)}</th>
              <th>{money(totSaldo)}</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
