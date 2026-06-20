// PM2 — Imagination (puerto 4003).
// Next.js carga /var/www/imagination/.env automáticamente (DB, claves, etc.).
// PM2 solo fija PORT/NODE_ENV para que `next start` escuche en el puerto del holding.
module.exports = {
  apps: [
    {
      name: "imagination",
      cwd: "/var/www/imagination",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "600M",
      env: {
        NODE_ENV: "production",
        PORT: "4003",
      },
    },
  ],
};
