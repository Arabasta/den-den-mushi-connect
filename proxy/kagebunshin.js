import cluster from 'node:cluster';
import { availableParallelism } from "node:os";
import process from 'node:process';
import {config} from "./config/config.js";
import {sshdConfig} from "./system/sshd_config.js";

if (cluster.isPrimary) {
    console.log(`Max SSH connections: ${sshdConfig.MaxSessions}`);
    console.log(`Max SSH sessions: ${sshdConfig.MaxStartups}`);

    let clusters = config.server.clusters;

    if (clusters === "max") {
        clusters = availableParallelism();
        console.log(`Setting number of clusters to maximum available CPUs ${clusters}.`);
    } else {
        clusters = parseInt(clusters, 10);
        console.log(`Setting number of clusters to ${clusters}.`);
    }

    console.log(`Primary is running with PID ${process.pid}`);

    for (let i = 0; i < clusters; i++) {
        const worker = cluster.fork();
        console.log(`Spawned a new worker process with PID ${worker.process.pid}`);
    }

    cluster.on("exit", (worker, code, signal) => {
        if (signal) {
            console.log(`worker ${worker.process.pid} was killed by signal: ${signal}. Restarting...`);
            cluster.fork();
        } else if (code !== 0) {
            console.log(`worker ${worker.process.pid} exited with error code: ${code}. Restarting...`);
            cluster.fork();
        } else {
            console.log(`worker ${worker.process.pid} success`);
        }
    });
} else {
    import ("./server/server.js");
    console.log(`Worker ${process.pid} started`);
}