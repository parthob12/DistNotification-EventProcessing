const run = async () => {
  const resp = await fetch("http://localhost:3000/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      type: "user.signup",
      payload: { userId: "u1", email: "test@example.com" },
      source: "manual_test"
    })
  });

  const body = await resp.json().catch(() => ({}));
  console.log(resp.status, body);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
