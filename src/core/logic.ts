import { EnvironmentContext, InitContext, InitOutContext } from "./context";
import { Chain } from "./chaining";
export abstract class Trigger<Params, ContextAdditions, EnvContext extends EnvironmentContext> extends Chain<Params, ContextAdditions, EnvContext> {
    public async build(context: InitContext<EnvContext>): Promise<void> {
        return await this.execute(context)
    }
}
export abstract class Action<Params, ContextAdditions, EnvContext extends EnvironmentContext> extends Chain<Params, ContextAdditions, EnvContext> {
    protected async init(parameters: Params, context: InitContext<EnvContext>, callback: (context: InitOutContext<EnvContext, ContextAdditions>) => void): Promise<void> {
        callback(await this.run(parameters, context));
    }
    protected abstract run(parameters: Params, context: InitContext<EnvContext>): Promise<InitOutContext<EnvContext, ContextAdditions>>;
}
export abstract class Condition<Params, EnvContext extends EnvironmentContext> extends Chain<Params, {}, EnvContext> {
    private isInverted: boolean = false;
    public not(): Condition<Params, EnvContext> {
        this.isInverted = !this.isInverted;
        return this;
    }

    // TODO: it's impossible to differentiate in logs whether the condition failed or took forever to execute, an additional log message when condition check fails would be needed
    protected async init(parameters: Params, context: InitContext<EnvContext>, callback: (context: InitOutContext<EnvContext, {}>) => void): Promise<void> {
        if(await this.check(parameters, context) !== this.isInverted)
            callback(context.unfreeze());
    }
    protected abstract check(parameters: Params, context: InitContext<EnvContext>): Promise<boolean>;
}
export abstract class Modifier<Params, ContextAdditions, EnvContext extends EnvironmentContext> extends Chain<Params, ContextAdditions, EnvContext> {

}