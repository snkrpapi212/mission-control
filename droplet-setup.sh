#!/bin/bash
# Mission Control Droplet Setup Script
# Run on fresh Ubuntu 22.04/24.04 droplet

set -e

echo "🚀 Setting up Mission Control on Droplet..."

# Update system
apt-get update
apt-get install -y git curl build-essential nginx

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Create app directory
mkdir -p /opt/mission-control
cd /opt/mission-control

# Clone repo
git clone https://github.com/snkrpapi212/mission-control.git .
git checkout dev

# Install dependencies
npm install

# Build the app
npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'mission-control',
    script: 'npm',
    args: 'start',
    cwd: '/opt/mission-control',
    env: {
      NODE_ENV: 'production',
      PORT: '3000',
      NEXT_PUBLIC_CONVEX_URL: 'https://tidy-salamander-925.eu-west-1.convex.cloud',
      NEXT_PUBLIC_OPENCLAW_GATEWAY_URL: 'https://bilingually-flamier-alfonso.ngrok-free.dev',
      OPENCLAW_GATEWAY_TOKEN: 'ray5fsgde3hxrb4y9hdkr9092f9reb51'
    },
    instances: 1,
    autorestart: true,
    max_memory_restart: '500M',
    log_file: '/var/log/mission-control.log',
    out_file: '/var/log/mission-control-out.log',
    error_file: '/var/log/mission-control-error.log',
    merge_logs: true
  }]
};
EOF

# Setup Nginx reverse proxy
cat > /etc/nginx/sites-available/mission-control << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF

ln -sf /etc/nginx/sites-available/mission-control /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload nginx
nginx -t
systemctl reload nginx

# Start the app with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

echo "✅ Mission Control setup complete!"
echo "🌐 Access at: http://\$(curl -s ifconfig.me)"
echo "📋 Check logs: pm2 logs mission-control"
echo "🔄 Restart: pm2 restart mission-control"
