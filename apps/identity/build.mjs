import * as esbuild from "esbuild";

await esbuild.build({
    entryPoints: [{ in: "src/index.ts", out: "index"}],
    outdir: "dist",
    
    format: "esm",
    platform: "node",
    bundle: true,
    minify: false,

	banner: {
		js: [
			`import { createRequire } from 'module';`,
			`const require = createRequire(import.meta.url);`,
			`import { fileURLToPath } from 'url';`,
      		`import { dirname } from 'path';`,
			`const __filename = fileURLToPath(import.meta.url);`,
      		`const __dirname = dirname(__filename);`
		].join(' ')
	}
});