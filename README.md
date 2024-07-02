# Wraker

Wraker is a wrapper for NodeJS and Browser Worker API. It provides a simple `express` like API to manage inter-process communication between the main thread and the worker thread.

## Installation

```bash
npm install wraker@latest
```

## Usage

Wraker supports `require` and `import` syntax.

### Worker Thread

```javascript
import { WrakerApp } from "wraker";

const app = new WrakerApp();

app.use("ping", (req, res) => {
  res.send("Pong");
});

app.expose();
```

### Main Thread

```javascript
import { Wraker } from "wraker";

const url = new URL("./worker.js", import.meta.url);
const worker = new Wraker(url, {
  type: "module",
});

worker.on("pong", (event) => {
  console.log(event.data); // "Pong"
});

worker.emit("ping");
```

## License

Wraker is licensed under the MIT License. See [LICENSE](LICENSE) for the full license text.
