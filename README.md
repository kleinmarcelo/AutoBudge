# AutoBudge - Sistema de Orçamentos Premium 🚗💼

O **AutoBudge** é um aplicativo web Single Page Application (SPA) moderno, responsivo e esteticamente premium projetado especificamente para prestadores de serviços (como Estética Automotiva, detalhamento, mecânicas ou serviços gerais) gerenciarem seus clientes, criarem orçamentos profissionais e exportarem PDFs elegantes de alta qualidade.

O aplicativo roda **100% no lado do cliente (offline-first)** utilizando o armazenamento local do navegador (`localStorage`) para persistir os dados da empresa, clientes e orçamentos de forma segura e imediata, sem necessidade de servidores ou bancos de dados externos.

---

## 🌟 Recursos Principais

1. **Painel de Controle (Dashboard)**:
   - Resumo dinâmico de faturamento mensal e contagem de orçamentos (em aberto e aprovados).
   - Lista rápida de orçamentos recentemente emitidos que ainda estão pendentes (Em Aberto).
   - Pastas de clientes organizadas em ordem alfabética (A-Z) com cliques que filtram os orçamentos do cliente selecionado.
2. **Gerenciador de Clientes (CRUD Completo)**:
   - Adicione, edite ou exclua clientes de forma intuitiva.
   - Sincronização automática com dados dos veículos (Modelo, Placa, Cor).
3. **Editor Dinâmico de Orçamentos**:
   - Autocompleta dados cadastrais do cliente e do veículo.
   - Adição e exclusão dinâmica de itens de serviços e produtos.
   - Cálculos em tempo real de subtotais, descontos aplicados e valor total líquido.
   - Campos customizáveis de condições (pagamento, prazos, garantia e termos gerais).
4. **Configurações "Minha Empresa"**:
   - Cadastro completo dos dados da sua empresa (Nome, CNPJ, Endereço, Telefone, E-mail).
   - Upload do logotipo da empresa com conversão e persistência automatizada para Base64.
5. **Configurações de Retenção e Expiração**:
   - Defina o prazo em dias que deseja manter os orçamentos salvos. A aplicação remove ou arquiva automaticamente orçamentos antigos expirados para manter a integridade do seu banco local.
6. **Backup Completo em JSON**:
   - Exporte um arquivo de backup com todas as suas informações para segurança física ou importação em outro dispositivo.
7. **Exportação de PDF Premium**:
   - Geração de PDF físico simulado no formato A4, com fidelidade absoluta de design, resolução 2x mais nítida para impressão e contorno perfeito de dados baseado no documento modelo fornecido.

---

## 🛠️ Tecnologias Utilizadas

- **Estruturação**: HTML5 Semântico.
- **Estilização**: CSS3 Moderno (Vanilla CSS), incluindo variáveis CSS, Grid, Flexbox, efeito glassmorphism e animações fluidas.
- **Lógica e Estado**: JavaScript Moderno (ES6+).
- **Biblioteca de PDF**: [html2pdf.js](https://github.com/eKoopmans/html2pdf.js/) via CDN para renderização HTML para PDF vetorial de alta definição.
- **Ícones**: FontAwesome v6 via CDN.
- **Tipografia**: Google Fonts (fontes *Inter* e *Outfit*).

---

## 📂 Estrutura do Projeto

```text
├── .gitignore          # Filtros para versionamento Git
├── README.md           # Este manual de documentação
├── index.html          # Estrutura principal da SPA
├── style.css           # Estilização visual premium e regras de impressão A4
├── app.js              # Lógica principal de negócios, persistência e modais
├── pdf.js              # Estruturação e exportação em alta definição para PDF
└── test_protocol.md    # Protocolo oficial de testes e logs de bugs corrigidos
```

---

## 🚀 Como Executar Localmente

Como o **AutoBudge** foi desenvolvido em Vanilla JavaScript sem compiladores, iniciá-lo é incrivelmente simples:

1. Dê um duplo clique no arquivo `index.html` na pasta do seu computador para abri-lo diretamente em qualquer navegador moderno (Google Chrome, Microsoft Edge, Firefox, Safari, etc.).
2. O aplicativo já iniciará preenchido com **dados de demonstração** (clientes e orçamentos modelo) para você ver o sistema funcionando de imediato!
3. Acesse a aba **Configurações** para preencher os dados da sua empresa, fazer o upload da sua própria logomarca e salvar. Os dados de exemplo serão substituídos pelas suas informações reais assim que começar a cadastrar.

---

## 🌐 Publicação no Git e Hospedagem Gratuita (GitHub Pages)

Para manter seus arquivos salvos em nuvem com segurança (Git/GitHub) e ter um **link na web para acessar o aplicativo do celular de qualquer lugar do mundo** de forma 100% gratuita, siga o passo a passo abaixo:

### Passo 1: Fazer o Primeiro Commit Local (Git)
O repositório Git local já foi inicializado no seu diretório de trabalho. Para salvar os arquivos locais na sua máquina, execute os seguintes comandos no seu terminal de comando (PowerShell ou terminal integrado do editor):

```bash
# 1. Adicionar todos os arquivos desenvolvidos ao controle do Git
git add .

# 2. Registrar as alterações locais com uma mensagem descritiva
git commit -m "feat: Versão inicial premium do AutoBudge"
```

### Passo 2: Criar o Repositório no GitHub
1. Acesse o site do [GitHub](https://github.com/) e faça login em sua conta (se não possuir, crie uma gratuitamente).
2. No canto superior direito da tela inicial, clique no botão **"+"** e selecione **"New repository"** (Novo repositório).
3. Preencha os dados:
   - **Repository name**: `appde-orcamnetos` (ou o nome que preferir).
   - **Public/Private**: Escolha **Public** (Público) para conseguir utilizar a hospedagem gratuita do GitHub Pages.
   - **Initialize this repository with**: Deixe todas as caixas de seleção desmarcadas (não adicione README, .gitignore ou Licença por lá, pois já criamos estes arquivos localmente).
4. Clique em **"Create repository"** (Criar repositório).

### Passo 3: Conectar seu Repositório Local ao GitHub
Na página que se abre após a criação do repositório no GitHub, você verá alguns comandos sugeridos na seção *"or push an existing repository from the command line"*. Execute-os no seu terminal dentro do diretório do projeto:

```bash
# 1. Renomear a branch padrão local para "main"
git branch -M main

# 2. Conectar sua pasta local ao link do repositório que você acabou de criar no GitHub
# (Substitua "SEU-USUARIO" pelo seu nome de usuário do GitHub)
git remote add origin https://github.com/SEU-USUARIO/appde-orcamnetos.git

# 3. Enviar todos os seus arquivos locais para a nuvem do GitHub
git push -u origin main
```

### Passo 4: Ativar a Hospedagem Gratuita (GitHub Pages)
Agora que seus arquivos estão hospedados no GitHub, vamos publicar a aplicação online:
1. No seu repositório do GitHub, clique na aba **"Settings"** (Configurações) localizada no menu superior horizontal.
2. Na barra lateral esquerda, desça até a seção *Code and automation* e clique em **"Pages"**.
3. Na seção *Build and deployment*, abaixo de *Source*, configure:
   - **Branch**: Selecione `main`.
   - **Folder**: Selecione `/ (root)` (a pasta raiz).
4. Clique no botão **"Save"** (Salvar) ao lado.
5. Aguarde cerca de 1 a 2 minutos. O GitHub processará os arquivos e exibirá no topo da mesma página um link público destacado, como:
   `Your site is live at https://SEU-USUARIO.github.io/appde-orcamnetos/`

**Pronto!** O seu aplicativo de orçamentos está publicado na internet! Você pode abrir esse link no seu smartphone, tablet ou computador para gerar orçamentos e baixar os PDFs diretamente com seus clientes no pátio da sua empresa.

---

> [!TIP]
> **Dica Importante sobre Logomarcas**: 
> Como os dados do aplicativo são armazenados localmente no seu próprio navegador (`localStorage`) que tem um limite de capacidade máxima aproximado de 5 Megabytes (MB), evite carregar arquivos de imagem excessivamente grandes no logotipo da empresa nas configurações. Prefira imagens comprimidas ou convertidas de até **500 Kilobytes (KB)**. Isso garante que você possa salvar milhares de clientes e orçamentos sem nunca esgotar o armazenamento local!
