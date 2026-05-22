# Protocolo de Testes - AutoBudge

Este documento estabelece o protocolo de teste padrão para todas as funcionalidades principais do aplicativo de orçamentos **AutoBudge**. Ele foi criado para que agentes de desenvolvimento e testadores possam reproduzir com exatidão as etapas de validação, identificando problemas e documentando as soluções propostas.

---

## 1. Roteiros de Teste Funcionais

### Caso de Teste 01: Navegação SPA e Responsividade
* **Objetivo**: Verificar se o fluxo entre as abas da Single Page Application ocorre sem erros e se a interface se adapta a dispositivos móveis.
* **Passos**:
  1. Abrir o aplicativo no navegador.
  2. Clicar em cada um dos itens do menu lateral (Painel, Orçamentos, Clientes, Configurações).
  3. Redimensionar a janela do navegador para simular a largura de uma tela de smartphone (ex: 375px).
  4. Clicar no botão "Novo Orçamento" no topo direito do cabeçalho de qualquer aba.
* **Resultado Esperado**:
  - A troca de abas deve ocorrer de forma instantânea, suave e sem recarregar a página.
  - No celular, a barra lateral deve se contrair exibindo apenas ícones de forma polida e o menu deve se ajustar perfeitamente sem quebrar o layout.
  - O botão "Novo Orçamento" deve abrir diretamente o formulário de edição na aba "Criar Novo Orçamento".

### Caso de Teste 02: CRUD de Clientes
* **Objetivo**: Validar a inserção, edição e exclusão de clientes e a consistência dos dados dos veículos.
* **Passos**:
  1. Acessar a aba "Clientes".
  2. Clicar em "Adicionar Cliente" e preencher todos os campos obrigatórios com dados de teste. Salvar.
  3. Clicar no ícone de lápis (Editar) do cliente recém-criado, alterar a placa do veículo e salvar.
  4. Digitar o nome do cliente no campo de busca na parte superior da tabela.
  5. Clicar no ícone de lixeira (Excluir) e confirmar a exclusão.
* **Resultado Esperado**:
  - O cadastro de novos clientes deve persistir e atualizar a tabela imediatamente.
  - A edição deve mostrar os dados preenchidos corretamente nos campos e salvá-los perfeitamente.
  - A busca deve filtrar os clientes instantaneamente à medida que o usuário digita.
  - A exclusão deve remover o cliente da tabela de forma imediata e exibir uma notificação (toast) de aviso correspondente.

### Caso de Teste 03: CRUD de Orçamentos e Cálculos Automáticos
* **Objetivo**: Verificar a criação de orçamentos, seleção automatizada de dados de clientes, cálculo matemático dos totais e descontos.
* **Passos**:
  1. Acessar a aba "Criar Novo Orçamento".
  2. Selecionar um cliente no dropdown.
  3. Verificar se os campos de modelo, placa e cor do veículo foram autocompletados.
  4. Adicionar 2 itens na lista de serviços. Preencher com:
     - Item 1: Quantidade = 2, Valor Unitário = R$ 150,00.
     - Item 2: Quantidade = 1, Valor Unitário = R$ 400,00.
  5. Adicionar um desconto de R$ 50,00 no campo correspondente.
  6. Salvar o orçamento.
* **Resultado Esperado**:
  - Ao selecionar o cliente, os campos do veículo e suas respectivas informações cadastrais devem ser puxados dinamicamente para os inputs.
  - O subtotal do orçamento deve calcular automaticamente R$ 700,00.
  - Ao aplicar o desconto de R$ 50,00, o valor total deve mudar instantaneamente para R$ 650,00.
  - Ao salvar, o sistema deve registrar o orçamento atribuindo um número sequencial único e retornar para a tela inicial (Painel).

### Caso de Teste 04: Persistência de Dados (IndexedDB / LocalStorage)
* **Objetivo**: Garantir que as alterações em clientes, orçamentos e dados da empresa permaneçam salvas na IndexedDB (AutoBudgeDB) com fallback robusto no LocalStorage.
* **Passos**:
  1. Cadastrar um cliente ou orçamento de teste.
  2. Pressionar `F5` ou recarregar a aba no navegador.
  3. Verificar se o registro inserido permanece intacto na tabela correspondente.
  4. (Opcional) Executar a aplicação com dados prévios no localStorage e verificar a migração automática para o IndexedDB.
* **Resultado Esperado**:
  - Todos os dados inseridos devem persistir na IndexedDB através de recarregamentos da página.
  - Se existirem dados antigos no localStorage, eles devem ser migrados transparentemente para a IndexedDB no primeiro carregamento.

### Caso de Teste 05: Limpeza e Retenção de Orçamentos (Dias)
* **Objetivo**: Testar se o mecanismo de expiração de orçamentos remove ou arquiva adequadamente documentos após o prazo de retenção configurado.
* **Passos**:
  1. Acessar a aba "Configurações".
  2. Ajustar o prazo de retenção de orçamentos para 5 dias.
  3. Acessar o `localStorage` (via console de desenvolvedor F12 do navegador se necessário) e simular um orçamento com data de emissão de 10 dias atrás e status "Em Aberto".
  4. Recarregar o aplicativo (`F5`).
* **Resultado Esperado**:
  - O orçamento criado artificialmente com 10 dias deve ser detectado e automaticamente removido da listagem.
  - Um aviso (toast notification) deve alertar o usuário sobre a remoção automática com sucesso.

### Caso de Teste 06: Configurações de Empresa e Upload de Logo
* **Objetivo**: Testar o upload da imagem do logotipo, conversão para Base64 e sua perfeita exibição na barra lateral e prévias.
* **Passos**:
  1. Acessar a aba "Configurações".
  2. No painel "Informações da Minha Empresa", fazer o upload de uma imagem JPG ou PNG qualquer.
  3. Preencher os demais campos e salvar as informações da empresa.
  4. Observar a miniatura exibida no rodapé da barra lateral de navegação (Sidebar).
* **Resultado Esperado**:
  - A imagem selecionada deve ser carregada imediatamente no preview do formulário.
  - Ao salvar o formulário, a imagem em Base64 deve ser persistida e exibida polidamente na sidebar lateral esquerda.

### Caso de Teste 07: Backup e Importação de Dados
* **Objetivo**: Testar a portabilidade do banco de dados local com download e carregamento de JSON.
* **Passos**:
  1. Com dados cadastrados, clicar no botão "Exportar Backup dos Dados (JSON)" nas configurações.
  2. Salvar o arquivo gerado.
  3. Limpar o localStorage do navegador ou clicar no botão "Importar Backup (Restaurar)" e selecionar o arquivo JSON que acabou de baixar.
* **Resultado Esperado**:
  - A exportação deve iniciar e concluir o download de um arquivo JSON estruturado contendo todos os dados.
  - A importação do mesmo arquivo deve detectar a estrutura correta, carregar os dados de forma idêntica e recarregar a aplicação de forma automatizada.

### Caso de Teste 08: Visualização e Exportação de PDF
* **Objetivo**: Validar se o orçamento montado no container de simulação física A4 condiz com o PDF modelo e se a exportação gera um arquivo idêntico.
* **Passos**:
  1. Ir para a aba "Painel" ou "Orçamentos".
  2. Clicar no botão azul de PDF (Visualizar) de um dos orçamentos da lista.
  3. Verificar o layout da folha A4 no modal (alinhamento, logo, tabela de serviços e termos de rodapé).
  4. Clicar em "Baixar PDF" no topo direito do modal.
  5. Abrir o arquivo PDF baixado no sistema.
* **Resultado Esperado**:
  - O modal de visualização deve simular com extrema fidelidade uma folha física de papel A4.
  - O PDF exportado deve manter com perfeita resolução e legibilidade todas as informações do orçamento, logo e observações, no mesmo padrão estético e estrutural do arquivo de base do usuário.

---

## 2. Registro de Execução de Testes e Correções (Logs do Agente)

| ID do Caso | Descrição do Caso | Status | Problema Identificado | Solução Aplicada |
| :--- | :--- | :---: | :--- | :--- |
| **TC-01** | Navegação SPA e Responsividade | Aprovado | Nenhum problema. | Lógica de abas executou perfeitamente. Layout adaptou-se muito bem a telas móveis. |
| **TC-02** | CRUD de Clientes | Aprovado | Nenhum problema. | A busca e modais responderam sem lentidão. O localStorage funcionou de imediato. |
| **TC-03** | CRUD de Orçamentos e Cálculos | Aprovado | Valor de descontos permitindo negativo | Tratado na lógica de cálculo do `app.js` para garantir mínimo de R$ 0,00 e bloqueando totais negativos. |
| **TC-04** | Persistência Local | Aprovado | Nenhum problema. | A IndexedDB manteve dados após recarregamento via F5 e migrou o legado com sucesso. |
| **TC-05** | Expiração de Orçamentos | Aprovado | Nenhum problema. | A rotina no carregamento identificou orçamentos expirados e aplicou o toast notificativo. |
| **TC-06** | Upload de Logomarca | Aprovado | Nenhum problema com IndexedDB | Resolvido! Com a migração para IndexedDB, a aplicação agora suporta logos pesadas de alta resolução sem bater na cota de 5MB. |
| **TC-07** | Backup JSON | Aprovado | Nenhum problema. | Exportação e importação operaram perfeitamente com recarregamento nativo da página. |
| **TC-08** | Geração e Exportação de PDF | Aprovado | Algumas quebras de página da biblioteca html2pdf | Ajustado o padding e o layout das tabelas para que os orçamentos de tamanho padrão caibam em 1 ou 2 páginas sem corte brusco. |
