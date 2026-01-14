import { useEffect, useState } from "react";
import { endpoints, get } from "../services/api";

type TotaisPessoaItem = {
  pessoaId: number;
  pessoaNome: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
};

type TotaisGeral = {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
};

type TotaisPorPessoaResponse = {
  itens: TotaisPessoaItem[];
  totalGeral: TotaisGeral;
};

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function TotaisPorPessoaPage() {
  // Estados de controle geral da tela
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Dados do relatório (itens por pessoa + total geral)
  const [data, setData] = useState<TotaisPorPessoaResponse | null>(null);

  // Carrega o relatório de totais por pessoa do back-end
  async function carregar() {
    setLoading(true);
    setErro(null);
    try {
      const res = await get<TotaisPorPessoaResponse>(endpoints.relTotaisPorPessoa);
      setData(res);
    } catch (e: any) {
      setErro(e.message || "Erro ao carregar totais por pessoa");
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
      <h1>Totais por pessoa</h1>

      <div className="card">
        <button onClick={carregar} disabled={loading}>
          Recarregar
        </button>

        {loading && <p className="muted">Carregando...</p>}
        {erro && <p className="error">{erro}</p>}

        {data && (
          <table>
            <thead>
              <tr>
                <th>Pessoa</th>
                <th>Total receitas</th>
                <th>Total despesas</th>
                <th>Saldo</th>
              </tr>
            </thead>

            <tbody>
              {data.itens.map((i) => (
                <tr key={i.pessoaId}>
                  <td>{i.pessoaNome}</td>
                  <td>{money(i.totalReceitas)}</td>
                  <td>{money(i.totalDespesas)}</td>
                  <td>{money(i.saldo)}</td>
                </tr>
              ))}

              {data.itens.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="muted">
                    Sem dados.
                  </td>
                </tr>
              )}
            </tbody>

            {/* Total geral (somatório de todas as pessoas) */}
            <tfoot>
              <tr>
                <th>Total geral</th>
                <th>{money(data.totalGeral.totalReceitas)}</th>
                <th>{money(data.totalGeral.totalDespesas)}</th>
                <th>{money(data.totalGeral.saldo)}</th>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
