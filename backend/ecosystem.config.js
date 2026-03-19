module.exports = {
  apps: [
    {
      name: "aria-api",
      script: "python",
      args: "-m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload",
      cwd: "./backend",
      interpreter: "none",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        PYTHONPATH: "./backend",
        PYTHONUNBUFFERED: "1"
      }
    },
    {
      name: "aria-processor",
      script: "python",
      args: "workers/message_processor.py",
      cwd: "./backend",
      interpreter: "none",
      autorestart: true,
      restart_delay: 3000,
      max_memory_restart: "512M",
      env: { PYTHONPATH: "./backend" }
    },
    {
      name: "aria-briefing",
      script: "python",
      args: "workers/briefing_generator.py",
      cwd: "./backend",
      interpreter: "none",
      autorestart: true,
      restart_delay: 5000,
      max_memory_restart: "256M",
      env: {
        PYTHONPATH: "./backend",
        RUN_BRIEFING_NOW: "false"
      }
    },
    {
      name: "aria-watchdog",
      script: "python",
      args: "watchers/filesystem_watcher.py",
      cwd: ".",
      interpreter: "none",
      autorestart: true,
      restart_delay: 5000,
      max_memory_restart: "128M"
    }
  ]
};
