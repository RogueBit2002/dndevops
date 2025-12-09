import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import onlyWarn from "eslint-plugin-only-warn";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,	
  { plugins: { onlyWarn } }
);