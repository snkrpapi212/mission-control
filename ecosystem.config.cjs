/**
 * PM2 Ecosystem Configuration for Mission Control
 * Manages the notification daemon.
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs
 *   pm2 logs mc-notifications
 *   pm2 restart mc-notifications
 *   pm2 stop mc-notifications
 */

module.exports = {
  apps: [
    {
      name: "mc-notifications",
      script: "src/daemon/notify-daemon.ts",
      interpreter: "npx",
      interpreter_args: "tsx",
      cwd: __dirname,
      watch: false,
      ignore_watch: ["node_modules", ".git", "convex", ".next"],
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: "10s",
      env: {
        NODE_ENV: "production",
        CONVEX_URL: "https://tidy-salamander-925.eu-west-1.convex.cloud",
      },
      env_development: {
        NODE_ENV: "development",
        CONVEX_URL: "https://avid-husky-435.eu-west-1.convex.cloud",
      },
      error_file: "/tmp/mc-notifications-error.log",
      out_file: "/tmp/mc-notifications-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: false,
    },
  ],
};
