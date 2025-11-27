module.exports = {
  apps: [{
    name: 'eventpulse-api',
    script: './server.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '400M',
    min_uptime: '10s',
    max_restarts: 50,
    restart_delay: 2000,
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      NODE_OPTIONS: '--max-old-space-size=400'
    },
    error_file: '/home/ec2-user/.pm2/logs/eventpulse-api-error.log',
    out_file: '/home/ec2-user/.pm2/logs/eventpulse-api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true
  }]
};
