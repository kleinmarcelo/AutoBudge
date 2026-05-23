const PROJECT_ID = "iugehtybopstqobasuwm";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2VodHlib3BzdHFvYmFzdXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0ODAxMzUsImV4cCI6MjA5NTA1NjEzNX0.lLdTxvEfzT4C6-BNDvcyOK9SJfQdblbakJDInYm8Xlc";

const signupUrl = `https://${PROJECT_ID}.supabase.co/auth/v1/signup`;

const payload = JSON.stringify({
  email: "exemplo@gmail.com",
  password: "exemplo123",
  options: {
    data: {
      company_name: "Estética Real de Teste",
      company_phone: "(11) 99999-9999"
    }
  }
});

console.log("=====================================================");
console.log(" Tentando cadastrar empresa na nuvem do Supabase... ");
console.log("=====================================================\n");
console.log(`Enviando requisição de cadastro para: ${signupUrl}`);

fetch(signupUrl, {
  method: 'POST',
  headers: {
    'apikey': ANON_KEY,
    'Content-Type': 'application/json'
  },
  body: payload
})
.then(async response => {
  const isOk = response.ok;
  const status = response.status;
  const data = await response.json();
  
  if (isOk) {
    console.log("\n ✅ CADASTRO EFETUADO COM SUCESSO!");
    console.log("=====================================================");
    console.log(`E-mail: exemplo@gmail.com`);
    console.log(`Senha: exemplo123`);
    console.log(`ID do Usuário Criado: ${data.id || data.user.id}`);
    console.log(`Confirmado: ${data.user ? data.user.confirmed_at : 'Aguardando confirmação de e-mail se ativo'}`);
    console.log("=====================================================");
    console.log("\nO usuário de testes foi criado no seu painel do Supabase com sucesso!");
  } else {
    console.log(`\n ❌ FALHA NO CADASTRO (Status: ${status})`);
    console.log("=====================================================");
    console.log("Mensagem de erro:", data.msg || data.message || JSON.stringify(data));
    console.log("=====================================================");
  }
})
.catch(error => {
  console.error("\n ❌ ERRO DE CONECTIVIDADE:", error.message);
});
