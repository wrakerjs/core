// @ts-nocheck
console.info("Tests are not supported yet. Worker needs to be polyfilled.");
process.exit(0);

import { Wraker } from "../Wraker.js";

const worker = new Wraker(new URL("./worker.js", import.meta.url), {
  type: "module",
  name: "WrakerWorker",
});

worker.once("ready", () => {
  console.log("[Main] Worker is ready!");
  worker.emit("hello");
});

worker.on("hello", () => {
  console.log("[Main] Hello from Worker!");
});
