const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

// NodePort mapping — no port-forward needed ever
const LAB_PORTS = {
  "linux-forensics": 32083,
  "malware":         32230,
  "web-security":    32235,
};

const startLab = async (labId) => {
    return new Promise((resolve) => {
        try {
            console.log(`[K8S] Starting lab: ${labId}`);

            const nodePort = LAB_PORTS[labId];
            if (!nodePort) {
                return resolve({ success: false, error: `No NodePort configured for lab: ${labId}` });
            }

            const webTerminalUrl = `http://localhost:${nodePort}`;

            // Resolve individual YAML path
            const possiblePaths = [
                path.resolve(__dirname, '..', 'k8s-labs', `${labId}.yaml`),
                path.join(process.cwd(), 'backend', 'k8s-labs', `${labId}.yaml`),
                path.join(process.cwd(), 'k8s-labs', `${labId}.yaml`)
            ];

            let yamlPath = null;
            for (const p of possiblePaths) {
                if (fs.existsSync(p)) { yamlPath = p; break; }
            }

            if (!yamlPath) {
                return resolve({ success: false, error: `YAML for "${labId}" not found.` });
            }

            // Check if already running
            exec(`kubectl get pods -l lab-id=${labId} --field-selector=status.phase=Running -o name`, (err, stdout) => {
                if (!err && stdout.trim().length > 0) {
                    console.log(`[K8S] Lab ${labId} already running → ${webTerminalUrl}`);
                    return resolve({ success: true, status: "already_running", webTerminalUrl });
                }

                // Apply YAML
                exec(`kubectl apply -f "${yamlPath}"`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`[K8S-ERROR] ${stderr || error.message}`);
                        return resolve({ success: false, error: stderr || error.message });
                    }
                    console.log(`[K8S] Lab ${labId} started → ${webTerminalUrl}`);
                    resolve({ success: true, status: "started", webTerminalUrl });
                });
            });
        } catch (e) {
            resolve({ success: false, error: e.message });
        }
    });
};

const stopLab = async (labId) => {
    return new Promise((resolve) => {
        try {
            const yamlPath = path.resolve(__dirname, '..', 'k8s-labs', `${labId}.yaml`);
            const cmd = fs.existsSync(yamlPath)
                ? `kubectl delete -f "${yamlPath}"`
                : `kubectl delete all -l lab-id=${labId}`;

            exec(cmd, (error, stdout, stderr) => {
                if (error) return resolve({ success: false, error: stderr || error.message });
                resolve({ success: true, status: "stopped" });
            });
        } catch (e) {
            resolve({ success: false, error: e.message });
        }
    });
};

const getLabStatus = async (labId) => {
    return new Promise((resolve) => {
        exec(`kubectl get pods -l lab-id=${labId} --field-selector=status.phase=Running -o name`, (err, stdout) => {
            const running = !err && stdout.trim().length > 0;
            resolve({
                status: running ? "running" : "stopped",
                webTerminalUrl: running ? `http://localhost:${LAB_PORTS[labId]}` : null
            });
        });
    });
};

module.exports = { startLab, stopLab, getLabStatus };
