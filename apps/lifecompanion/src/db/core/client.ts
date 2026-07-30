import makeActionWorkerSender from "../../utils/shared/worker/makeActionWorkerSender";
import type { DBActionRegistry } from "../actions/dbActionRegistryregistry";

const WORKER_NAME = "DB Worker";
const WORKER = new Worker(new URL("./worker.ts", import.meta.url), {
	name: WORKER_NAME,
	type: "module",
});

type DBWorkerSender = <
	K extends keyof DBActionRegistry<P>,
	// biome-ignore lint/suspicious/noExplicitAny: generic parameters to allow inference
	P extends Parameters<DBActionRegistry<any>[K]>[0],
>(
	action: K,
	payload?: P,
) => ReturnType<DBActionRegistry<P>[K]>;

export const sendToDBWorker = makeActionWorkerSender<DBWorkerSender>(WORKER, {
	workerName: WORKER_NAME,
	timeout: 30 * 1000,
});
