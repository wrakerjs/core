import { WrakerApp } from "../WrakerApp.js";

const app = new WrakerApp();

app.use("hello", (req, res) => {
  console.log("[Worker] Hello, World!");

  res.send("Hello, World!");
});

app.expose(() => {
  console.log("[Worker] WrakerApp is ready!");
});

setTimeout(() => {
  app.close();
}, 1000);
