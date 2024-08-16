# Wraker

[![josselinonduty - wraker](https://img.shields.io/static/v1?label=josselinonduty&message=wraker&color=blueviolet&logo=github)](https://github.com/josselinonduty/wraker "Go to GitHub repo")
[![release](https://img.shields.io/github/release/josselinonduty/wraker?include_prereleases=&sort=semver&color=teal)](https://github.com/josselinonduty/wraker/releases/)
[![license](https://img.shields.io/badge/License-MIT-orange?label="license")](https://github.com/josselinonduty/wraker/blob/main/LICENSE)
<br />
[![node](https://img.shields.io/badge/node-%5E18.0.0-blue?logo=node.js)](https://www.npmjs.com/package/wraker)
[![size](https://img.shields.io/bundlephobia/minzip/wraker?color=blue&label=size)](https://bundlephobia.com/result?p=wraker)
[![language](https://img.shields.io/github/languages/top/josselinonduty/wraker?logo=typescript)](https://typescriptlang.org)

![workflow - wraker](https://img.shields.io/github/actions/workflow/status/josselinonduty/wraker/test.yml?label="pipeline")
[![codecov](https://codecov.io/github/josselinonduty/wraker/graph/badge.svg?token=A872AFRRJ0)](https://codecov.io/github/josselinonduty/wraker)
[![issues](https://img.shields.io/github/issues/josselinonduty/wraker)](https://github.com/josselinonduty/wraker/issues)
[![contrib](https://img.shields.io/github/contributors/josselinonduty/wraker?color=teal)](https://github.com/josselinonduty/wraker)
[![downloads](https://img.shields.io/npm/dm/wraker?color=teal)](https://www.npmjs.com/package/wraker)
[![stars](https://img.shields.io/github/stars/josselinonduty/wraker?style=social)](https://github.com/josselinonduty/wraker)

Wraker is a wrapper for [web workers](https://developer.mozilla.org/docs/Web/API/Worker/Worker).
It makes it easier to manage the communication between the main thread and the worker thread through a simple `express` like API.

## Documentation

- [API Reference](https://josselinonduty.github.io/wraker/)
- [MDN Web Workers](https://developer.mozilla.org/docs/Web/API/Worker/Worker)

## Getting started

### Using a CDN or a static server

Create a new file `worker.js`:

```js
import { WrakerApp } from "https://cdn.jsdelivr.net/npm/wraker/+esm";

const app = new WrakerApp();

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.listen();
```

Then, create a new file `main.js`:

```js
import { Wraker } from "https://cdn.jsdelivr.net/npm/wraker/+esm";

const worker = new Wraker("worker.js", {
  type: "module",
  name: "my-first-worker",
});

worker.fetch("/ping").then((response) => {
  console.log(response.body); // "pong"
});
```

Finally, create a web page `index.html` and serve it:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Wraker</title>
  </head>

  <body>
    <script type="module" src="main.js"></script>
  </body>
</html>
```

> ℹ️ You must serve your files using a server because of the CORS policy. If you open the `index.html` file directly in your browser, you will get an error as the worker will not be able to fetch the `index.js` and `worker.js` files.
>
> You can use any server to serve your files. You can use [express](https://www.npmjs.com/package/express). Other good options are [http-server](https://www.npmjs.com/package/http-server), python's [http.server](https://docs.python.org/3/library/http.server.html), or [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for VSCode.

## Using a Node.js bundler

```bash
npm install wraker
```

### Vite (Nuxt, Vue, Svelte, etc.)

Vite automatically resolves `"./worker.js?worker"` to a worker class and `"./worker.js?url"` to a worker url. Please refer to the [Vite documentation](https://v3.vitejs.dev/guide/features.html#import-with-query-suffixes) for more information.

You can take advantage of this feature to create a worker with Wraker:

```js
// worker.js
import { WrakerApp } from "wraker";
```

```js
// main.js using ?worker shorthand
import { Wraker } from "wraker";
import myWorker from "./worker.js?worker";

const worker = new myWorker();
const wraker = new Wraker.fromWorker(worker);
```

```js
// main.js using ?url shorthand
import { Wraker } from "wraker";
import myWorkerUrl from "./worker.js?url";

const worker = new Wraker(myWorkerUrl, {
  type: "module",
});
```

```js
// main.js using the full path
import { Wraker } from "wraker";

const myWorkerUrl = new URL("./worker.js", import.meta.url);

const worker = new Wraker(myWorkerUrl, {
  type: "module",
});
```

### Webpack (React, Angular, etc.)

The correct way to use Wraker with Webpack is to use the full path to the worker file. Please refer to the [Webpack documentation](https://webpack.js.org/guides/web-workers/) for more information.

```js
// main.js
import { Wraker } from "wraker";

const myWorkerUrl = new URL("./worker.js", import.meta.url);

const worker = new Wraker(myWorkerUrl, {
  type: "module",
});
```

> ℹ️ You may be able to use the `?worker` or `?url` shorthands, but it is using workarounds and may not work as expected. Refer to [this discussion](https://github.com/vitejs/vite/issues/13680) for details.

## Contributing

Please read the [CONTRIBUTING.md](CONTRIBUTING.md) file for more information.

## License

Wraker is licensed under the MIT License. See [LICENSE](LICENSE) for the full license text.
