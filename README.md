# Controle-de-Gastos-Residenciais-Front-End

Aplicação Front-end desenvolvida em **React + TypeScript**, responsável pela interface do sistema de controle de gastos residenciais.  
O front consome uma **API .NET** para gerenciamento de pessoas, categorias, transações e relatórios.

---

## Tecnologias

- **React**
- **TypeScript**
- **Vite**
- **Fetch API**
- **CSS**

---

## Funcionalidades

### Pessoas
- Cadastro de pessoas
- Listagem de pessoas
- Exclusão de pessoas
- Exibição de mensagens de erro retornadas pela API

Regras exibidas na interface:
- Idade deve ser um número inteiro positivo
- Ao excluir uma pessoa, suas transações também são removidas

---

### Categorias
- Cadastro de categorias
- Listagem de categorias

Campos:
- Descrição
- Finalidade (`despesa`, `receita`, `ambas`)

---

### Transações
- Cadastro de transações
- Listagem de transações

Campos:
- Pessoa
- Categoria
- Tipo (`despesa` ou `receita`)
- Descrição
- Valor

Regras:
- Pessoas menores de idade não podem receber receitas
- Categoria deve ser compatível com o tipo da transação

---

### Relatórios
- Totais por pessoa
  - Total de receitas
  - Total de despesas
  - Saldo
  - Total geral
- Totais por categoria
  - Total de receitas
  - Total de despesas
  - Saldo
  - Total geral

