import makeActionWorkerHandler from "../../utils/shared/worker/makeActionWorkerHandler";
import dbActionRegistryregistry from "../actions/dbActionRegistryregistry";

self.onmessage = makeActionWorkerHandler(dbActionRegistryregistry);
