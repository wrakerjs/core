import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

import packageJson from "./package.json" with { type: "json" };
const name = packageJson.main.replace(/\.js$/, "");

/**
 * @param {import('rollup').RollupOptions} config
 * @returns {import('rollup').RollupOptions}
 */
const bundle = (config) => ({
  ...config,
  input: "./src/index.ts",
  external: (id) => !/^[./]/.test(id),
});

export default [
  bundle({
    plugins: [
      esbuild({
        minify: true,
        treeShaking: true,
      }),
      resolve({
        browser: true,
      }),
      commonjs(),
    ],
    output: [
      {
        file: `${name}.js`,
        format: "cjs",
        sourcemap: true,
        compact: true,
      },
      {
        file: `${name}.mjs`,
        format: "es",
        sourcemap: true,
        compact: true,
      },
    ],
    treeshake: "recommended",
    
  }),
  bundle({
    plugins: [dts()],
    output: {
      file: `${name}.d.ts`,
      format: "es",
    },
  }),
];
