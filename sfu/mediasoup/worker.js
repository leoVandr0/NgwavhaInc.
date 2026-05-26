// mediasoup worker lifecycle. Workers host the native C++ media threads.
// We spawn N workers on boot and hand them out round-robin to new rooms.

import * as mediasoup from 'mediasoup';
import config from '../config.js';

const workers = [];
let nextWorkerIdx = 0;

export async function createWorkers() {
    const { numWorkers, worker: workerSettings } = config.mediasoup;

    for (let i = 0; i < numWorkers; i++) {
        const worker = await mediasoup.createWorker({
            logLevel: workerSettings.logLevel,
            logTags: workerSettings.logTags,
            rtcMinPort: workerSettings.rtcMinPort,
            rtcMaxPort: workerSettings.rtcMaxPort
        });

        worker.on('died', () => {
            console.error(
                `❌ mediasoup worker ${worker.pid} died — exiting in 2s so the process manager restarts us`
            );
            setTimeout(() => process.exit(1), 2000);
        });

        workers.push(worker);
        console.log(`✅ mediasoup worker ${worker.pid} ready`);
    }

    console.log(
        `🎥 ${workers.length} mediasoup worker(s) running, media ports ${workerSettings.rtcMinPort}-${workerSettings.rtcMaxPort}`
    );
}

// Round-robin worker selection so rooms spread across CPU cores.
export function getNextWorker() {
    if (workers.length === 0) {
        throw new Error('No mediasoup workers available — call createWorkers() first');
    }
    const worker = workers[nextWorkerIdx];
    nextWorkerIdx = (nextWorkerIdx + 1) % workers.length;
    return worker;
}

export function getWorkers() {
    return workers;
}
