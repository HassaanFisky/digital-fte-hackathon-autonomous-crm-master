async function test() {
  const url = 'https://hassaanfisky-aira-digital-fte.vercel.app/api/agent';
  const body = {
    message: "I was charged twice and I need this fixed urgently",
    agentType: "classifier"
  };
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
