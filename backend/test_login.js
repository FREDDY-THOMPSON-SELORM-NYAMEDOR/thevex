(async () => {
  const res = await fetch('http://localhost:4000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'tester@vex.app', password: 'Secret123' })
  });
  const text = await res.text();
  console.log(text);
})();
