import { Context, FrozenContext, GlobalContext } from "./context";
import { Chain } from "./chaining";
import { EnvironmentContext } from "./module";

export abstract class Trigger<Params, ContextAdditions, EnvContext extends EnvironmentContext> extends Chain<Params, ContextAdditions, EnvContext> {
    public async build(context: FrozenContext<GlobalContext["init"] & EnvContext["init"]>): Promise<void> {
        return await this.execute(context)
    }
}
export abstract class Action<Params, ContextAdditions, EnvContext extends EnvironmentContext> extends Chain<Params, ContextAdditions, EnvContext> {
    protected async init(parameters: Params, context: FrozenContext<GlobalContext["init"] & EnvContext["init"]>, callback: (context: Context<GlobalContext["init"] & EnvContext["init"] & ContextAdditions>) => void): Promise<void> {
        callback(await this.run(parameters, context));
    }
    protected abstract run(parameters: Params, context: FrozenContext<GlobalContext["init"] & EnvContext["init"]>): Promise<Context<GlobalContext["init"] & EnvContext["init"] & ContextAdditions>>;
}
export abstract class Condition<Params, EnvContext extends EnvironmentContext> extends Chain<Params, {}, EnvContext> {
    private isInverted: boolean = false;
    public not(): Condition<Params, EnvContext> {
        this.isInverted = !this.isInverted;
        return this;
    }

    // TODO: it's impossible to differentiate in logs whether the condition failed or took forever to execute, an additional log message when condition check fails would be needed
    protected async init(parameters: Params, context: FrozenContext<GlobalContext["init"] & EnvContext["init"]>, callback: (context: Context<GlobalContext["init"] & EnvContext["init"]>) => void): Promise<void> {
        if(await this.check(parameters, context) !== this.isInverted)
            callback(context.unfreeze());
    }
    protected abstract check(parameters: Params, context: FrozenContext<GlobalContext["init"] & EnvContext["init"]>): Promise<boolean>;
}
export abstract class Modifier<Params, ContextAdditions, EnvContext extends EnvironmentContext> extends Chain<Params, ContextAdditions, EnvContext> {

}