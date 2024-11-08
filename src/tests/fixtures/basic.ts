import { defineWrakerApp } from "../../server";
const app = defineWrakerApp();

app.get("/", (_, res) => {
  res.send({
    status: 200,
  });
});

app.get("/hello", (_, res) => {
  res.send("Hello, world!");
});

app.all("/reflect", (req, res) => {
  res.send(req.body);
});

app.all("/wait", async (req, res) => {
  await new Promise((resolve) =>
    setTimeout(resolve, req.body?.timeout ?? 1000)
  );
  res.send("Done");
});

app.listen();
