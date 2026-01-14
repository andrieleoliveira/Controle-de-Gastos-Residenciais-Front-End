export type FinalidadeCategoria = "despesa" | "receita" | "ambas";
export type TipoTransacao = "despesa" | "receita";

export type Pessoa = {
  id: number;
  nome: string;
  idade: number;
};

export type Categoria = {
  id: number;
  descricao: string;
  finalidade: FinalidadeCategoria;
};

export type Transacao = {
  id: number;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  categoriaId: number;
  pessoaId: number;

  categoriaDescricao?: string;
  pessoaNome?: string;
};

export type TotaisPessoa = {
  pessoaId: number;
  pessoaNome: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
};

export type TotaisPessoaResponse = {
  itens: TotaisPessoa[];
  totalGeralReceitas: number;
  totalGeralDespesas: number;
  saldoGeral: number;
};

export type TotaisCategoria = {
  categoriaId: number;
  categoriaDescricao: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
};

export type TotaisCategoriaResponse = {
  itens: TotaisCategoria[];
  totalGeralReceitas: number;
  totalGeralDespesas: number;
  saldoGeral: number;
};
