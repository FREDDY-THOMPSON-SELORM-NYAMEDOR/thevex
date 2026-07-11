(async () => {
  const res = await fetch('http://localhost:4000/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Tester', email: 'tester@vex.app', phone: '5551234', password: 'Secret123' })
  });
  const text = await res.text();
  console.log(text);
})();
