const SUPABASE_URL = "https://iugehtybopstqobasuwm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2VodHlib3BzdHFvYmFzdXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0ODAxMzUsImV4cCI6MjA5NTA1NjEzNX0.lLdTxvEfzT4C6-BNDvcyOK9SJfQdblbakJDInYm8Xlc";

async function testUpsert() {
    console.log("Testando UPSERT com ID de texto...");
    
    const dbClient = {
        id: "c-" + Date.now(),
        name: "Cliente Teste Text ID",
        phone: "123456789",
        email: "teste@teste.com"
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/clients`, {
        method: "POST", // upsert requires POST with On-Conflict header or just POST for insert
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation,resolution=merge-duplicates"
        },
        body: JSON.stringify(dbClient)
    });

    const data = await res.json();
    console.log("Status da resposta:", res.status);
    console.log("Corpo da resposta:", data);
}

testUpsert();
