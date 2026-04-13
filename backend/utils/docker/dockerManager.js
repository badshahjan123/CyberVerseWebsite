const Docker = require('dockerode');
const docker = new Docker();

/**
 * Build a lab config object from a Lab DB document.
 * Falls back to sensible defaults so old labs still work.
 */
function buildConfig(lab) {
    return {
        imageName:     lab.dockerImage        || `cyberverseweb-main-${lab.dockerId}-lab:latest`,
        containerName: `cyberverse-${lab.dockerId}`,
        port:          lab.dockerPort         || 8083,
        internalPort:  lab.dockerInternalPort || 7681,
    };
}

/**
 * Start a lab container.
 * @param {string} labId  - Lab slug / dockerId (e.g. 'linux-forensics')
 * @param {object} [labDoc] - Optional Lab mongoose document (avoids extra DB query)
 */
async function startLab(labId, labDoc) {
    // Resolve config — accept a pre-fetched doc or look it up
    let labConfig;
    if (labDoc) {
        labConfig = buildConfig(labDoc);
    } else {
        const Lab = require('../../models/Lab');
        const doc = await Lab.findOne({ $or: [{ slug: labId }, { dockerId: labId }] });
        if (!doc) throw new Error(`Lab not found: ${labId}`);
        labConfig = buildConfig(doc);
    }

    try {
        const existingContainer = docker.getContainer(labConfig.containerName);
        try {
            const info = await existingContainer.inspect();
            if (info.State.Running) {
                return {
                    containerId: info.Id,
                    webTerminalUrl: `http://localhost:${labConfig.port}`,
                    status: 'already_running',
                };
            }
            await existingContainer.start();
            return {
                containerId: info.Id,
                webTerminalUrl: `http://localhost:${labConfig.port}`,
                status: 'restarted',
            };
        } catch (_) {
            // Container doesn't exist yet — fall through to create
        }

        const container = await docker.createContainer({
            Image: labConfig.imageName,
            name:  labConfig.containerName,
            ExposedPorts: { [`${labConfig.internalPort}/tcp`]: {} },
            HostConfig: {
                PortBindings: {
                    [`${labConfig.internalPort}/tcp`]: [{ HostPort: `${labConfig.port}` }],
                },
                AutoRemove: false,
                RestartPolicy: { Name: 'no' },
            },
            Env: ['TERM=xterm-256color'],
        });

        await container.start();
        const info = await container.inspect();

        return {
            containerId: info.Id,
            webTerminalUrl: `http://localhost:${labConfig.port}`,
            status: 'started',
        };
    } catch (error) {
        throw new Error(`Failed to start lab: ${error.message}`);
    }
}

/**
 * Stop and remove a lab container.
 */
async function stopLab(labId, labDoc) {
    let labConfig;
    if (labDoc) {
        labConfig = buildConfig(labDoc);
    } else {
        const Lab = require('../../models/Lab');
        const doc = await Lab.findOne({ $or: [{ slug: labId }, { dockerId: labId }] });
        if (!doc) throw new Error(`Lab not found: ${labId}`);
        labConfig = buildConfig(doc);
    }

    try {
        const container = docker.getContainer(labConfig.containerName);
        const info = await container.inspect();
        if (info.State.Running) await container.stop({ t: 10 });
        await container.remove();
        return { status: 'stopped', message: `Lab ${labId} stopped successfully` };
    } catch (error) {
        if (error.statusCode === 404) {
            return { status: 'not_found', message: `Lab ${labId} container not found` };
        }
        throw new Error(`Failed to stop lab: ${error.message}`);
    }
}

/**
 * Get container status for a lab.
 */
async function getLabStatus(labId, labDoc) {
    let labConfig;
    if (labDoc) {
        labConfig = buildConfig(labDoc);
    } else {
        const Lab = require('../../models/Lab');
        const doc = await Lab.findOne({ $or: [{ slug: labId }, { dockerId: labId }] });
        if (!doc) throw new Error(`Lab not found: ${labId}`);
        labConfig = buildConfig(doc);
    }

    try {
        const container = docker.getContainer(labConfig.containerName);
        const info = await container.inspect();
        return {
            status: info.State.Running ? 'running' : 'stopped',
            containerId: info.Id,
            uptime: info.State.Running ? info.State.StartedAt : null,
            webTerminalUrl: info.State.Running ? `http://localhost:${labConfig.port}` : null,
        };
    } catch (error) {
        if (error.statusCode === 404) return { status: 'not_found' };
        throw new Error(`Failed to get lab status: ${error.message}`);
    }
}

module.exports = { startLab, stopLab, getLabStatus };
