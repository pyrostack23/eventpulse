module.exports = {
  apps: [{
    name: 'eventpulse-backend',
    cwd: '/var/www/eventpulse/backend',
    script: 'server.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster', // Cluster mode for load balancing
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/var/www/eventpulse/logs/error.log',
    out_file: '/var/www/eventpulse/logs/out.log',
    log_file: '/var/www/eventpulse/logs/combined.log',
    time: true,
    
    // Auto-restart on crash
    min_uptime: '10s',
    max_restarts: 10,
    
    // Exponential backoff restart delay
    restart_delay: 4000,
    
    // Kill timeout
    kill_timeout: 5000,
    
    // Listen timeout
    listen_timeout: 10000,
    
    // Graceful shutdown
    shutdown_with_message: true,
    
    // Monitoring
    instance_var: 'INSTANCE_ID',
    
    // Merge logs
    merge_logs: true,
    
    // Log date format
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Environment variables
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }],

  // Deployment configuration
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/eventpulse.git',
      path: '/var/www/eventpulse',
      'post-deploy': 'cd backend && npm install --production && pm2 reload ecosystem.config.js --env production',
      'pre-deploy-local': 'echo "Deploying to production..."'
    }
  }
};
