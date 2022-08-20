import { multi } from "../core/logic";
import ConsoleLogAction from "../core/actions/console_log";
import IntervalTrigger from "../core/triggers/interval";

type Params = {
    intervals: number[]
}

export default (parameters: Params) => {
    let events = multi()
    for(let interval of parameters.intervals) {
        events.on(new IntervalTrigger({time: interval}))
              .do(new ConsoleLogAction(ctx =>({message: `Logging from ${ctx.intervalRepetition} repetition of interval ${ctx.intervalTime} in guild ${ctx.guildId}`})))
    }
    return events
}