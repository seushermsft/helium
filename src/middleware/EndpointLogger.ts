import * as restify from "restify";
import { Container } from "inversify";
import { ILoggingProvider } from "../logging/iLoggingProvider";
import { ITelemProvider } from "../telem/itelemprovider";
import { DateUtilities } from "../utilities/dateUtilities";

/**
 * Endpoint logger and telem sender
 * Adds start/end logs and telemetry to every endpoint
 * @param container The inversify container with the logger and telem client
 */
export default function responseDuration(container: Container) {
    // get the log and telem clients
    const log = container.get<ILoggingProvider>("ILoggingProvider");
    const telem = container.get<ITelemProvider>("ITelemProvider");

    // return a function with the correct middleware signature
    return function responseTime(req: restify.Request, res: restify.Response, next) {
        // start tracking time
        const duration = DateUtilities.getTimer();
        // create string unique to this action at this endpoint
        const apiName = `${req.method} ${req.url}`;
        // log endpoint call start
        log.Trace("API Endpoint Called: " + apiName);
        telem.trackEvent(apiName);

        // hook into response finish to log call duration/result
        res.on("finish", (() => {
            telem.trackMetric(telem.getMetricTelemetryObject(
                apiName + " duration",
                duration(),
            ));

            log.Trace(apiName + "  Result: " + res.statusCode, req.getId());
        }));

        // call next middleware
        next();
    };
}
