module.exports = {
  apps: [{
    name: 'home-assistant-local-control',
    script: 'dist/examples/05-full-app.js',
    watch: false,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '30s',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      LOG_LEVEL: 'info',
    },
    env_production: {
      NODE_ENV: 'production',
      LOG_LEVEL: 'info',
    },
    env_development: {
      NODE_ENV: 'development',
      LOG_LEVEL: 'debug',
    },
    // Error handling
    exp_backoff_restart_delay: 1000,
    // Logging
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    // Process management
    instances: 1,
    exec_mode: 'fork',
    // System signals
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 15000,
    // Additional monitoring
    pmx: true,
    // Restart conditions
    restart_delay: 5000,
    // Log file management
    log_file: './logs/app.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
  }],
}; 