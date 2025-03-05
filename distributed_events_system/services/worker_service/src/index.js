import { startMetricsServer } from "./metrics_server.js";
import { runForever } from "./worker.js";

startMetricsServer();
runForever();
