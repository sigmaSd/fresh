import { type BuildOptions } from "npm:esbuild-wasm";
import { denoPlugins } from "@luca/esbuild-deno-loader";

export interface FreshBundleOptions {
  dev: boolean;
  cwd: string;
  denoJsonPath: string;
  entryPoints: string[];
  target: string | string[];
  jsxImportSource?: string;
}

let esbuild: null | typeof import("npm:esbuild-wasm") = null;

export async function bundleJs(options: FreshBundleOptions) {
  if (esbuild === null) {
    esbuild = Deno.env.get("FRESH_ESBUILD_LOADER") === "portable"
      ? await import("npm:esbuild-wasm")
      : await import("npm:esbuild");

    await esbuild.initialize({});
  }

  try {
    await Deno.mkdir(options.cwd, { recursive: true });
  } catch (err) {
    if (!(err instanceof Deno.errors.AlreadyExists)) {
      throw err;
    }
  }

  // In dev-mode we skip identifier minification to be able to show proper
  // component names in Preact DevTools instead of single characters.
  const minifyOptions: Partial<BuildOptions> = options.dev
    ? {
      minifyIdentifiers: false,
      minifySyntax: true,
      minifyWhitespace: true,
    }
    : { minify: true };

  const bundle = await esbuild.build({
    entryPoints: options.entryPoints,

    platform: "browser",
    target: options.target,

    format: "esm",
    bundle: true,
    splitting: true,
    treeShaking: true,
    sourcemap: options.dev ? "linked" : false,
    ...minifyOptions,

    jsxDev: options.dev,
    jsx: "automatic",
    jsxImportSource: options.jsxImportSource ?? "preact",

    absWorkingDir: options.cwd,
    outdir: ".",
    write: false,
    metafile: true,

    plugins: [
      ...denoPlugins({ configPath: options.denoJsonPath }),
    ],
  });
}
