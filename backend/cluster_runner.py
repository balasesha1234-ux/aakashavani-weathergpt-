"""
==============================================================================
🚀 AakashaVani (WeatherGPT) — Multi-Node Cluster & Load Balancer Orchestrator
Architecture: Horizontal Port Clustering & Vertical Multi-Core Worker Scaling
==============================================================================
"""

import sys
import os
import subprocess
import time
import signal
import multiprocessing

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Cluster Configuration
DEFAULT_PORTS = [8001, 8002, 8003]
CPU_CORES = multiprocessing.cpu_count()
# Vertical Scaling: Allocate worker concurrency based on physical CPU cores
WORKERS_PER_NODE = max(2, min(4, CPU_CORES))

class ClusterManager:
    def __init__(self, ports=None):
        self.ports = ports or DEFAULT_PORTS
        self.processes = {}
        self.running = True

    def start_node(self, port: int):
        """Spawns an isolated Uvicorn instance on the given port."""
        print(f"🚀 [NODE-SPAWN] Launching Horizontal Node on port {port} ({WORKERS_PER_NODE} workers)...")
        cmd = [
            sys.executable, "-m", "uvicorn",
            "app.main:app",
            "--host", "0.0.0.0",
            "--port", str(port),
            "--workers", str(WORKERS_PER_NODE),
            "--access-log"
        ]
        proc = subprocess.Popen(cmd, cwd=os.path.dirname(os.path.abspath(__file__)))
        self.processes[port] = proc
        return proc

    def start_all(self):
        """Boots all horizontal cluster nodes."""
        print("=" * 70)
        print("🇮🇳 AAKASHAVANI HIGH-AVAILABILITY CLUSTER ORCHESTRATOR")
        print(f"💻 Detected CPU Cores: {CPU_CORES}")
        print(f"⚡ Vertical Scaling: {WORKERS_PER_NODE} worker threads per node")
        print(f"🔀 Horizontal Nodes: {len(self.ports)} instances across ports: {self.ports}")
        print(f"🎯 Total Cluster Capacity: {len(self.ports) * WORKERS_PER_NODE} concurrent request workers")
        print("=" * 70)

        for port in self.ports:
            self.start_node(port)
            time.sleep(1.0)  # Stagger boot to prevent SQLite lock contention

        print("\n✅ All horizontal nodes active!")
        print(f"👉 To front with Nginx: Set upstream proxy_pass to {self.ports}")

    def monitor_and_heal(self):
        """Active cluster watchdog: auto-respawns failed nodes."""
        try:
            while self.running:
                time.sleep(3.0)
                for port, proc in list(self.processes.items()):
                    ret = proc.poll()
                    if ret is not None:
                        print(f"⚠️ [WATCHDOG] Node on port {port} exited with code {ret}. Resizing & Auto-Healing...")
                        self.start_node(port)
        except KeyboardInterrupt:
            self.shutdown()

    def shutdown(self):
        """Gracefully terminates all child nodes."""
        print("\n🛑 Shutting down AakashaVani cluster nodes...")
        self.running = False
        for port, proc in self.processes.items():
            print(f" - Terminating node on port {port} (PID {proc.pid})...")
            try:
                proc.terminate()
                proc.wait(timeout=3)
            except Exception:
                proc.kill()
        print("✅ All cluster nodes gracefully stopped.")

if __name__ == "__main__":
    cluster = ClusterManager()
    
    def sig_handler(signum, frame):
        cluster.shutdown()
        sys.exit(0)

    signal.signal(signal.SIGINT, sig_handler)
    signal.signal(signal.SIGTERM, sig_handler)

    cluster.start_all()
    cluster.monitor_and_heal()
