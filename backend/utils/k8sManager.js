const { exec, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Store active port-forward processes
const activeTunnels = new Map();

/**
 * Kubernetes Manager - Dynamic Lab Resolution
 * Files stored in: backend/k8s-labs
 */

const startLab = async (labId) => {
    return new Promise((resolve, reject) => {
        try {
            console.log(`[K8S-DEBUG] Attempting to start lab: ${labId}`);
            
            // 1. Resolve Path - Try multiple common locations to be safe
            const possiblePaths = [
                path.resolve(__dirname, '..', 'k8s-labs', `${labId}.yaml`),
                path.join(process.cwd(), 'backend', 'k8s-labs', `${labId}.yaml`),
                path.join(process.cwd(), 'k8s-labs', `${labId}.yaml`)
            ];
            
            let yamlPath = null;
            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    yamlPath = p;
                    break;
                }
            }

            if (!yamlPath) {
                console.error(`[K8S-ERROR] Lab file ${labId}.yaml not found in any search path.`);
                return resolve({ 
                    success: false, 
                    error: `YAML configuration for "${labId}" not found on server.` 
                });
            }

            console.log(`[K8S-DEBUG] Resolved YAML path: ${yamlPath}`);

            // 2. Check if already running
            const checkCmd = `kubectl get pods -l lab-id=${labId} --field-selector=status.phase=Running -o name`;
            exec(checkCmd, (err, stdout) => {
                
                // Helper to start tunnel
                const startTunnel = () => {
                    if (activeTunnels.has(labId)) {
                        activeTunnels.get(labId).kill();
                    }
                    console.log(`[TUNNEL] Starting port-forward for ${labId}...`);
                    const tunnel = spawn("kubectl", ["port-forward", `service/cyber-lab-${labId}-service`, "8083:8083"]);
                    
                    tunnel.on('close', (code) => {
                        if (code !== 0 && activeTunnels.has(labId)) {
                            console.log("[TUNNEL] Re-attempting tunnel...");
                            setTimeout(startTunnel, 3000);
                        }
                    });

                    activeTunnels.set(labId, tunnel);
                };

                if (!err && stdout.trim().length > 0) {
                    console.log(`[K8S-DEBUG] Lab ${labId} already running.`);
                    
                    // Start tunnel if not active
                    if (!activeTunnels.has(labId)) {
                        startTunnel();
                    }

                    return resolve({ 
                        success: true, 
                        status: "already_running",
                        webTerminalUrl: "http://localhost:8083" 
                    });
                }

                // 3. Apply configuration
                const applyCmd = `kubectl apply -f "${yamlPath}"`;
                console.log(`[K8S-DEBUG] Executing: ${applyCmd}`);

                exec(applyCmd, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`[K8S-ERROR] Deployment Failed: ${stderr || error.message}`);
                        return resolve({ success: false, error: stderr || error.message });
                    }

                    console.log(`[K8S-SUCCESS] Lab ${labId} started. Establishing tunnel...`);
                    
                    // Wait a few seconds for pod to be ready before tunneling
                    setTimeout(startTunnel, 3000);

                    resolve({ 
                        success: true, 
                        status: "started",
                        webTerminalUrl: "http://localhost:8083" 
                    });
                });
            });
        } catch (criticalError) {
            console.error(`[K8S-CRITICAL] Exception in startLab: ${criticalError.message}`);
            resolve({ success: false, error: criticalError.message });
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
            
            // Kill active tunnel if exists
            if (activeTunnels.has(labId)) {
                activeTunnels.get(labId).kill();
                activeTunnels.delete(labId);
            }

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
            if (!err && stdout.trim().length > 0) {
                resolve({ status: "running" });
            } else {
                resolve({ status: "stopped" });
            }
        });
    });
};

module.exports = { startLab, stopLab, getLabStatus };
