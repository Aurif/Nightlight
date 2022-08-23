import ConsoleLogAction from "../core/actions/console_log";
import { EnvironmentContext } from "../core/module";
import { ScenarioCreator, Scenario } from "../core/scenario";
import IntervalTrigger from "../core/triggers/interval";

type Params = {
    intervals: number[]
}

export default class TestScenario<EnvContext extends EnvironmentContext> extends Scenario<Params, EnvContext> {
    public do(parameters: Params, create: ScenarioCreator<EnvContext>): void {
        for(let interval of parameters.intervals) {
            create.on(new IntervalTrigger({time: interval}))
                  .do(new ConsoleLogAction(ctx =>({message: `Logging from ${ctx.intervalRepetition} repetition of interval ${ctx.intervalTime}`})))
                  .do(new ConsoleLogAction(ctx =>({message: `Logging again from ${ctx.intervalRepetition} repetition of interval ${ctx.intervalTime}`})))
        }
    }
    
}