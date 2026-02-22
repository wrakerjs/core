# Wraker

[![wraker](https://img.shields.io/static/v1?label=wrakerjs&message=core&color=blueviolet&logo=github)](https://github.com/wrakerjs/core "Go to GitHub repo")
[![release](https://img.shields.io/github/release/wrakerjs/core?include_prereleases=&sort=semver&color=teal)](https://github.com/wrakerjs/core/releases/)
[![license](https://img.shields.io/badge/License-MIT-orange?label="license")](https://github.com/wrakerjs/core/blob/main/LICENSE)
<br />
[![node](https://img.shields.io/badge/node-%5E18.0.0-blue?logo=node.js)](https://www.npmjs.com/package/@wraker/core)
[![size](https://img.shields.io/bundlephobia/minzip/@wraker/core?color=blue&label=size)](https://bundlephobia.com/result?p=@wraker/core)
[![language](https://img.shields.io/github/languages/top/wrakerjs/core?logo=typescript)](https://typescriptlang.org)

![workflow - wraker](https://img.shields.io/github/actions/workflow/status/wrakerjs/core/test.yml?label="pipeline")
[![codecov](https://codecov.io/github/wrakerjs/core/graph/badge.svg?token=A872AFRRJ0)](https://codecov.io/github/wrakerjs/core)
[![issues](https://img.shields.io/github/issues/wrakerjs/core)](https://github.com/wrakerjs/core/issues)
[![contrib](https://img.shields.io/github/contributors/wrakerjs/core?color=teal)](https://github.com/wrakerjs/core)
[![downloads](https://img.shields.io/npm/dm/wraker?color=teal)](https://www.npmjs.com/package/@wraker/core)
[![stars](https://img.shields.io/github/stars/wrakerjs/core?style=social)](https://github.com/wrakerjs/core)

Wraker is a wrapper for [web workers](https://developer.mozilla.org/docs/Web/API/Worker/Worker).
It makes it easier to manage the communication between the main thread and the worker thread through a simple `express` like API.

## Documentation

- [API Reference](https://wrakerjs.github.io/core/)
- [MDN Web Workers](https://developer.mozilla.org/docs/Web/API/Worker/Worker)

## Getting started

### Using a CDN or a static server

Create a new file `worker.js`:

```js
import { defineWrakerApp } from "https://cdn.jsdelivr.net/npm/@wraker/core/+esm";

const app = defineWrakerApp();

app.get("/ping", (req, res) => {
  res.send("pong");
});

await app.listen();
```

Then, create a new file `main.js`:

```js
import { Wraker } from "https://cdn.jsdelivr.net/npm/@wraker/core/+esm";

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

### Using a Node.js bundler

```bash
npm install wraker
```

#### Vite (Nuxt, Vue, Svelte, etc.)

Vite automatically resolves `"./worker.js?worker"` to a worker class and `"./worker.js?url"` to a worker url. Please refer to the [Vite documentation](https://v3.vitejs.dev/guide/features.html#import-with-query-suffixes) for more information.

You can take advantage of this feature to create a worker with Wraker:

```js
// worker.js
import { defineWrakerApp } from "wraker";
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

#### Webpack (React, Angular, etc.)

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

## Plugins

Wraker supports a plugin system on **both sides** of the worker boundary:

- **Server-side** (`WrakerApp`, inside the worker) - extend the app with new methods, intercept incoming messages, hook into the request lifecycle.
- **Client-side** (`Wraker`, in the main thread) - extend the client with new methods, intercept outgoing/incoming messages.

### Using plugins

Use the `defineWrakerApp` / `defineWraker` factory functions with a `plugins` array. The factories ensure TypeScript infers the type extensions contributed by each plugin.

```ts
// worker.ts  (server-side, runs inside the Web Worker)
import { defineWrakerApp } from "@wraker/core";
import { myPluginServer } from "my-wraker-plugin";

const app = defineWrakerApp({
  plugins: [myPluginServer({ greeting: "Hello" })],
});

app.get("/demo", (req, res) => {
  res.send(app.greet("world"));
});

await app.listen();
```

```ts
// main.ts  (client-side, runs in the main thread)
import { defineWraker } from "@wraker/core";
import { myPluginClient } from "my-wraker-plugin";

const wraker = defineWraker(new URL("worker.ts", import.meta.url), {
  type: "module",
  plugins: [myPluginClient()],
});

// `wraker.greet` is fully typed
console.log(wraker.greet("world"));

const response = await wraker.fetch("/demo");
console.log(response.body);
```

### Creating a plugin

Use `defineWrakerAppPlugin` (server) and `defineWrakerPlugin` (client) to create reusable plugin factories. Plugins can:

- **Extend** the instance with new properties/methods via the `Extension` type parameter.
- **Accept options** via the `Options` type parameter.
- **Hook into lifecycle events** by implementing one or more hook callbacks.
- **Stop propagation** by returning `false` from any hook.

```ts
// my-wraker-plugin/server.ts
import { defineWrakerAppPlugin } from "@wraker/core";

type Extension = { greet: (name: string) => string };
type Options = { greeting: string };

export const myPluginServer = defineWrakerAppPlugin<Extension, Options>({
  name: "my-plugin",
  init(app, options) {
    app.greet = (name) => `${options?.greeting ?? "Hi"}, ${name}!`;
  },
});
```

```ts
// my-wraker-plugin/client.ts
import { defineWrakerPlugin } from "@wraker/core";

type Extension = { greet: (name: string) => string };

export const myPluginClient = defineWrakerPlugin<Extension>({
  name: "my-plugin",
  init(wraker) {
    wraker.greet = (name) => `Hello from client, ${name}!`;
  },
});
```

### Available lifecycle hooks

#### Server-side (`WrakerAppPlugin`)

| Hook                     | When it runs                                            |
| ------------------------ | ------------------------------------------------------- |
| `init`                   | Immediately when the app is constructed                 |
| `onListen`               | When `app.listen()` is called                           |
| `onBeforeMessageHandled` | Before each incoming message is processed               |
| `onAfterMessageHandled`  | After each incoming message has been processed          |
| `onError`                | When a route handler throws an error                    |
| `onMount`                | When a sub-router or sub-app is mounted via `app.use()` |
| `destroy`                | When `app.destroy()` is called                          |

Returning `false` from any hook stops the remaining plugins in the chain from running for that event. For `onBeforeMessageHandled`, returning `false` also prevents the request from being processed.

#### Client-side (`WrakerPlugin`)

| Hook                      | When it runs                                        |
| ------------------------- | --------------------------------------------------- |
| `init`                    | Immediately when the Wraker instance is constructed |
| `onBeforeMessageSent`     | Before a `fetch` call posts a message to the worker |
| `onAfterMessageSent`      | After the message has been posted to the worker     |
| `onBeforeMessageReceived` | Before an incoming worker message is handled        |
| `onAfterMessageReceived`  | After an incoming worker message has been handled   |
| `onError`                 | When a plugin hook throws an error                  |
| `destroy`                 | When `wraker.kill()` is called                      |

Returning `false` from any hook stops the remaining plugins in the chain. For `onBeforeMessageSent`, returning `false` prevents the message from being sent. For `onBeforeMessageReceived`, returning `false` prevents the default response handling (useful for intercepting custom message types).

## Contributing

Please read the [CONTRIBUTING.md](CONTRIBUTING.md) file for more information.

## License

Wraker is licensed under the MIT License. See [LICENSE](LICENSE) for the full license text.
