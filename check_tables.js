const SUPABASE_URL = "https://iugehtybopstqobasuwm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2VodHlib3BzdHFvYmFzdXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0ODAxMzUsImV4cCI6MjA5NTA1NjEzNX0.lLdTxvEfzT4C6-BNDvcyOK9SJfQdblbakJDInYm8Xlc";

async function check() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/company_profiles`, {
        method: "GET",
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`
        }
    });
    console.log("Status company_profiles:", res.status);
    
    const res2 = await fetch(`${SUPABASE_URL}/rest/v1/clients`, {
        method: "GET",
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`
        }
    });
    console.log("Status clients:", res2.status);
}
check();
