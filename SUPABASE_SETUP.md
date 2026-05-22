# ☁️ Guia de Integração com o Supabase - AutoBudge

Este guia orienta você a configurar seu banco de dados na nuvem no **Supabase** de forma 100% gratuita para ativar o sistema de **login, cadastro de empresas e sincronização em nuvem** no seu AutoBudge. Cada empresa criada terá seu e-mail e senha e o isolamento de dados é garantido de forma absoluta.

---

## 🚀 Passo 1: Criar sua Conta e Projeto no Supabase

1. Acesse o site do [Supabase](https://supabase.com/) e clique em **Start your project** ou **Sign In** (você pode fazer login com sua conta do GitHub com um clique).
2. Na sua tela de controle, clique no botão **New Project** (Novo Projeto).
3. Selecione a sua organização e preencha os dados do projeto:
   - **Name**: `AutoBudge` (ou o nome de sua preferência).
   - **Database Password**: Clique em *Generate a password* (Gere uma senha segura) e **salve essa senha em local seguro**!
   - **Region**: Selecione uma região próxima do Brasil (ex: `Saopaulo / (sa-east-1)`).
   - **Pricing Plan**: Escolha o plano **Free** (Gratuito).
4. Clique em **Create new project** (Criar novo projeto) e aguarde cerca de 1 a 2 minutos enquanto o Supabase configura seu servidor em nuvem.

---

## 🛠️ Passo 2: Executar o Script SQL no Supabase

Para criar as tabelas do aplicativo com políticas de segurança automatizadas que separam os dados de cada empresa de forma segura, siga estes passos simples:

1. No menu lateral esquerdo do painel do seu projeto no Supabase, clique no ícone de folha de código correspondente ao **SQL Editor**.
2. Clique no botão **New Query** (Nova Consulta) para abrir um editor de texto limpo.
3. Copie o script SQL completo abaixo e cole no campo de texto:

```sql
-- =========================================================================
-- 1. TABELA DE PERFIS DE EMPRESAS (company_profiles)
-- =========================================================================
create table public.company_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  name text not null,
  cnpj text,
  phone text not null,
  email text,
  address text,
  logo text, -- Guarda a imagem convertida em Base64
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (RLS)
alter table public.company_profiles enable row level security;

-- Criar políticas de segurança para company_profiles
create policy "Empresas podem ler seu próprio perfil" on public.company_profiles
  for select using (auth.uid() = user_id);

create policy "Empresas podem inserir seu próprio perfil" on public.company_profiles
  for insert with check (auth.uid() = user_id);

create policy "Empresas podem atualizar seu próprio perfil" on public.company_profiles
  for update using (auth.uid() = user_id);


-- =========================================================================
-- 2. TABELA DE CONFIGURAÇÕES DE PREFERÊNCIAS (system_settings)
-- =========================================================================
create table public.system_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  retention_days integer default 180,
  default_payment text,
  default_delivery text,
  default_warranty text,
  default_notice text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.system_settings enable row level security;

-- Criar políticas de segurança para system_settings
create policy "Empresas podem ler suas próprias preferências" on public.system_settings
  for select using (auth.uid() = user_id);

create policy "Empresas podem inserir suas próprias preferências" on public.system_settings
  for insert with check (auth.uid() = user_id);

create policy "Empresas podem atualizar suas próprias preferências" on public.system_settings
  for update using (auth.uid() = user_id);


-- =========================================================================
-- 3. TABELA DE CLIENTES (clients)
-- =========================================================================
create table public.clients (
  id text primary key, -- Mantém o id original do app (ex: c-timestamp)
  user_id uuid references auth.users not null,
  name text not null,
  phone text not null,
  email text,
  vehicle_model text not null,
  vehicle_plate text not null,
  vehicle_color text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.clients enable row level security;

-- Criar políticas de segurança para clients
create policy "Empresas podem ler seus próprios clientes" on public.clients
  for select using (auth.uid() = user_id);

create policy "Empresas podem cadastrar seus próprios clientes" on public.clients
  for insert with check (auth.uid() = user_id);

create policy "Empresas podem atualizar seus próprios clientes" on public.clients
  for update using (auth.uid() = user_id);

create policy "Empresas podem deletar seus próprios clientes" on public.clients
  for delete using (auth.uid() = user_id);


-- =========================================================================
-- 4. TABELA DE ORÇAMENTOS (budgets)
-- =========================================================================
create table public.budgets (
  id text primary key, -- Mantém o ID original (ex: b-0001)
  user_id uuid references auth.users not null,
  client_id text references public.clients(id) on delete cascade not null,
  date date not null,
  vehicle_model text,
  vehicle_plate text,
  vehicle_color text,
  items jsonb not null, -- Salva o array de itens estruturado
  discount numeric(10,2) default 0.00,
  total numeric(10,2) not null,
  status text not null,
  payment text,
  delivery text,
  warranty text,
  notice text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.budgets enable row level security;

-- Criar políticas de segurança para budgets
create policy "Empresas podem ler seus próprios orçamentos" on public.budgets
  for select using (auth.uid() = user_id);

create policy "Empresas podem cadastrar seus próprios orçamentos" on public.budgets
  for insert with check (auth.uid() = user_id);

create policy "Empresas podem atualizar seus próprios orçamentos" on public.budgets
  for update using (auth.uid() = user_id);

create policy "Empresas podem deletar seus próprios orçamentos" on public.budgets
  for delete using (auth.uid() = user_id);
```

4. Após colar o script, clique no botão **Run** (Executar) no canto inferior direito do painel de texto.
5. Você verá uma mensagem de sucesso como *"Success. No rows returned."*, indicando que suas tabelas e políticas de Row Level Security (RLS) estão criadas e ativas na nuvem!

---

## 🔑 Passo 3: Colar as Chaves de Acesso no Código do Aplicativo

Agora que seu banco de dados está pronto, precisamos conectar o código do AutoBudge ao seu projeto do Supabase:

1. No painel do seu projeto no Supabase, clique na engrenagem **Project Settings** (Configurações do Projeto) no menu inferior esquerdo.
2. Acesse a aba **API** na barra lateral de configurações.
3. Copie o endereço em **Project URL** (URL do Projeto).
4. Abra o arquivo `app.js` na raiz da pasta do seu aplicativo de orçamentos e, logo nas primeiras linhas, cole a sua URL substituindo `"SUA_SUPABASE_URL"`:
   ```javascript
   const SUPABASE_URL = "https://seu-codigo-projeto.supabase.co";
   ```
5. Volte à página de API do Supabase, copie a chave em **Project API keys** identificada como **`anon` `public`**.
6. Vá ao arquivo `app.js` e cole essa chave substituindo `"SUA_SUPABASE_ANON_KEY"`:
   ```javascript
   const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...";
   ```
7. Salve o arquivo `app.js`.

---

## 📤 Passo 4: Atualizar e Enviar para o GitHub

Com as chaves coladas e salvas localmente, envie as alterações para o seu repositório remoto para que seu aplicativo web online seja atualizado:

Abra o seu terminal no diretório do projeto e execute:
```bash
git add .
git commit -m "feat: Integração multi-empresa em nuvem com Supabase ativa"
git push origin main
```

**Pronto! 🎉** Seu AutoBudge agora é uma aplicação SaaS multi-empresa rodando na nuvem com autenticação segura por e-mail e senha. As empresas já podem acessar simultaneamente de notebooks, computadores e celulares e todos os dados estarão em tempo real sincronizados!
