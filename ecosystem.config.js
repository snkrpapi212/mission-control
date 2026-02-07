/**
 * PM2 Ecosystem Configuration for Mission Control
 * Manages the notification daemon and other services
 */

module.exports = {
  apps: [
    {
      // Notification Delivery Daemon
      name: "mc-notifications",
      script: "src/daemon/notify-daemon.ts",
      interpreter: "npx",
      interpreter_args: "tsx",
      watch: false, // Don't reload on file changes (intentional)
      ignore_watch: ["node_modules", ".git", "convex"],
      restart_delay: 5000, // Wait 5 seconds before restarting after crash
      max_restarts: 10, // Max restarts in restart_window
      restart_window: 60000, // Within 1 minute
      env: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
      error_file: "/tmp/mission-control-daemon-error.log",
      out_file: "/tmp/mission-control-daemon-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: false, // Keep error and out separate
    },
  ],

  // Deploy configuration (optional, for future multi-server deployment)
  deploy: {
    production: {
      user: "node",
      host: "production-server.com",
      ref: "origin/main",
      repo: "git@github.com:snkrpapi212/mission-control.git",
      path: "/var/www/mission-control",
      "post-deploy":
        "npm install && npm run build && pm2 reload ecosystem.config.js --env production",
      "pre-deploy-local": "echo 'Deploying to production...'",
    },
  },
};
