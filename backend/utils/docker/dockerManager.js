// Assumes: Docker Desktop running, dockerode npm package installed
// Manages Docker containers for CyberVerse labs using dockerode

const Docker = require('dockerode');
const docker = new Docker(); // Connects to Docker Desktop on Windows

// Whitelist of allowed lab IDs (security: prevent arbitrary container execution)
const ALLOWED_LABS = {
    'linux-forensics': {
        imageName: 'cyberverseweb-main-linux-forensics-lab:latest',
        containerName: 'cyberverse-linux-forensics',
        port: 8083,
        internalPort: 7681
    }
};

/**
 * Start a lab container
 * @param {string} labId - Lab identifier (e.g., 'linux-forensics')
 * @returns {Promise<{containerId: string, webTerminalUrl: string}>}
 */
async function startLab(labId) {
    // Security check: validate labId
    if (!ALLOWED_LABS[labId]) {
        throw new Error(`Invalid lab ID: ${labId}. Lab not found in whitelist.`);
    }

    const labConfig = ALLOWED_LABS[labId];

    try {
        // Check if container already exists
        const existingContainer = docker.getContainer(labConfig.containerName);

        try {
            const containerInfo = await existingContainer.inspect();

            // If container exists and is running, return existing info
            if (containerInfo.State.Running) {
                console.log(`✅ Container ${labConfig.containerName} already running`);
                return {
                    containerId: containerInfo.Id,
                    webTerminalUrl: `http://localhost:${labConfig.port}`,
                    status: 'already_running'
                };
            }

            // If container exists but stopped, start it
            console.log(`🔄 Starting existing container ${labConfig.containerName}`);
            await existingContainer.start();

            return {
                containerId: containerInfo.Id,
                webTerminalUrl: `http://localhost:${labConfig.port}`,
                status: 'restarted'
            };

        } catch (inspectError) {
            // Container doesn't exist, create new one
            console.log(`📦 Creating new container for ${labId}`);
        }

        // Create and start new container
        const container = await docker.createContainer({
            Image: labConfig.imageName,
            name: labConfig.containerName,
            ExposedPorts: {
                [`${labConfig.internalPort}/tcp`]: {}
            },
            HostConfig: {
                PortBindings: {
                    [`${labConfig.internalPort}/tcp`]: [{ HostPort: `${labConfig.port}` }]
                },
                AutoRemove: false, // Keep container for inspection
                RestartPolicy: { Name: 'no' }
            },
            Env: ['TERM=xterm-256color']
        });

        await container.start();
        const containerInfo = await container.inspect();

        console.log(`✅ Lab ${labId} started successfully`);
        console.log(`   Container ID: ${containerInfo.Id.substring(0, 12)}`);
        console.log(`   Terminal URL: http://localhost:${labConfig.port}`);

        return {
            containerId: containerInfo.Id,
            webTerminalUrl: `http://localhost:${labConfig.port}`,
            status: 'started'
        };

    } catch (error) {
        console.error(`❌ Error starting lab ${labId}:`, error.message);
        throw new Error(`Failed to start lab: ${error.message}`);
    }
}

/**
 * Stop and remove a lab container
 * @param {string} labId - Lab identifier
 * @returns {Promise<{status: string, message: string}>}
 */
async function stopLab(labId) {
    if (!ALLOWED_LABS[labId]) {
        throw new Error(`Invalid lab ID: ${labId}`);
    }

    const labConfig = ALLOWED_LABS[labId];

    try {
        const container = docker.getContainer(labConfig.containerName);
        const containerInfo = await container.inspect();

        // Stop container if running
        if (containerInfo.State.Running) {
            console.log(`🛑 Stopping container ${labConfig.containerName}`);
            await container.stop({ t: 10 }); // 10 second timeout
        }

        // Remove container
        console.log(`🗑️  Removing container ${labConfig.containerName}`);
        await container.remove();

        console.log(`✅ Lab ${labId} stopped and removed`);

        return {
            status: 'stopped',
            message: `Lab ${labId} stopped successfully`
        };

    } catch (error) {
        if (error.statusCode === 404) {
            return {
                status: 'not_found',
                message: `Lab ${labId} container not found (already stopped)`
            };
        }

        console.error(`❌ Error stopping lab ${labId}:`, error.message);
        throw new Error(`Failed to stop lab: ${error.message}`);
    }
}

/**
 * Get lab container status
 * @param {string} labId - Lab identifier
 * @returns {Promise<{status: string, containerId?: string, uptime?: string}>}
 */
async function getLabStatus(labId) {
    if (!ALLOWED_LABS[labId]) {
        throw new Error(`Invalid lab ID: ${labId}`);
    }

    const labConfig = ALLOWED_LABS[labId];

    try {
        const container = docker.getContainer(labConfig.containerName);
        const containerInfo = await container.inspect();

        return {
            status: containerInfo.State.Running ? 'running' : 'stopped',
            containerId: containerInfo.Id,
            uptime: containerInfo.State.Running ? containerInfo.State.StartedAt : null,
            webTerminalUrl: containerInfo.State.Running ? `http://localhost:${labConfig.port}` : null
        };

    } catch (error) {
        if (error.statusCode === 404) {
            return {
                status: 'not_found',
                message: 'Container does not exist'
            };
        }

        throw new Error(`Failed to get lab status: ${error.message}`);
    }
}

/**
 * List all available labs
 * @returns {Array<{labId: string, name: string, port: number}>}
 */
function listAvailableLabs() {
    return Object.keys(ALLOWED_LABS).map(labId => ({
        labId,
        name: ALLOWED_LABS[labId].containerName,
        port: ALLOWED_LABS[labId].port
    }));
}

module.exports = {
    startLab,
    stopLab,
    getLabStatus,
    listAvailableLabs,
    ALLOWED_LABS
};
