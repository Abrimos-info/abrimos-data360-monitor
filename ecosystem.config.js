module.exports = {
  apps: [{
    name: 'data360-monitor',
    script: 'data360-monitor.js',
    cwd: __dirname,
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      D360_PORT: 8090,
    },
    env_file: '.env',
  }],
};
