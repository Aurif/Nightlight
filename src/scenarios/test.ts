import ConsoleLogAction from "../core/actions/console_log";
import { ScenarioCreator, Scenario } from "../core/scenario";
import IntervalTrigger from "../core/triggers/interval";

type Params = {
    intervals: number[]
}

export default class TestScenario<EnvContext extends {guildId: string}> extends Scenario<Params, EnvContext> {
    public init(parameters: Params, create: ScenarioCreator<EnvContext>): void {
        for(let interval of parameters.intervals) {
            create.on(new IntervalTrigger({time: interval}))
                  .do(new ConsoleLogAction(ctx =>({message: `Logging from ${ctx.intervalRepetition} repetition of interval ${ctx.intervalTime} in ${ctx.guildId}`})))
                  .do(new ConsoleLogAction(ctx =>({message: `Logging again from ${ctx.intervalRepetition} repetition of interval ${ctx.intervalTime}`})))
        }
    }
    
}