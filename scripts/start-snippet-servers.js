const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load snippet-tester/.env without requiring dotenv
const envFile = path.join(__dirname, '..', 'snippet-tester', '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([^#=\s][^=]*?)\s*=\s*(.*?)\s*$/);
    if (m) process.env[m[1]] = m[2];
  }
}
const ports = require('./snippet-ports.json');

const SNIPPETS_DIR = path.join(__dirname, '..', 'snippets');
const NODE_PATH = path.join(__dirname, '..', 'server', 'node_modules');

for (const [variant, port] of Object.entries(ports)) {
  const backendPath = path.join(SNIPPETS_DIR, variant, 'backend.js');

  const child = spawn('node', [backendPath], {
    env: {
      ...process.env,
      PORT: String(port),
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_PUBLISHABLE_KEY: process.env.VITE_STRIPE_PK,
      VITE_STRIPE_PK: process.env.VITE_STRIPE_PK,
      NODE_PATH,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (data) => {
    process.stdout.write(`[${variant}:${port}] ${data}`);
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(`[${variant}:${port}] ${data}`);
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`[${variant}:${port}] exited with code ${code}`);
    }
  });

  console.log(`Started ${variant} on port ${port}`);
}

console.log('\nAll 12 snippet servers started. Press Ctrl+C to stop.');
