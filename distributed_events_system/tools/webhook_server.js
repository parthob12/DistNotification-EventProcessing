import express from "express";

const app = express();
app.use(express.json());

app.post("/webhooks/:type", (req, res) => {
  console.log("webhook", req.params.type, req.body.eventId);
  res.json({ ok: true });
});

app.listen(4000, () => {
  console.log("webhook_server_listening", 4000);
});
