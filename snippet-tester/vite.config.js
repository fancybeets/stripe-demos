import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const snippetPorts = require('../scripts/snippet-ports.json');

const portProxies = Object.fromEntries(
  Object.values(snippetPorts).map((port) => [
    `/api/${port}`,
    {
      target: `http://localhost:${port}`,
      rewrite: (p) => p.replace(new RegExp(`^/api/${port}`), ''),
    },
  ])
);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@stripe/stripe-js': path.resolve(__dirname, 'node_modules/@stripe/stripe-js'),
      '@stripe/react-stripe-js': path.resolve(__dirname, 'node_modules/@stripe/react-stripe-js'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  server: {
    proxy: portProxies,
  },
});
