module.exports = {
  apps: [{
    name: 'home-assistant-local-control',
    script: 'dist/examples/local-control.js',
    watch: false,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
    },
    env_production: {
      NODE_ENV: 'production',
    },
    // Error handling
    exp_backoff_restart_delay: 100,
    // Logging
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    // Process management
    instances: 1,
    exec_mode: 'fork',
    // System signals
    kill_timeout: 3000,
    wait_ready: true,
    listen_timeout: 10000,
  }],
}; 