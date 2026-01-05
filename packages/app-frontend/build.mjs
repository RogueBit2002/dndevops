import * as esbuild from "esbuild";
import { sassPlugin } from 'esbuild-sass-plugin';

import * as path from "path";

import fs from "fs";

await esbuild.build({
	entryPoints: [
		{ in: "src/pages/app/index.tsx", out: "index" },
		{ in: "src/pages/login/index.tsx", out: "login/index" }
	],

	outdir: "dist",

	format: "esm",
	platform: "browser",
	bundle: true,
	minify: false,
	splitting: true,
	jsx: "automatic",

	chunkNames: path.join("chunks","[name]-[hash]"),
	plugins: [sassPlugin()],
	loader: {
			".png": "dataurl",
			".woff": "file",
			".woff2": "file"
	}
});


fs.copyFileSync("index.html", "dist/index.html");
fs.copyFileSync("index.html", "dist/login/index.html");