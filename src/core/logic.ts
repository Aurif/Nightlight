import { Context, FrozenContext } from "./context";
import { Chain } from "./chaining";
import { EnvironmentContext } from "./module";

export abstract class Trigger<Params, ContextAdditions, EnvContext extends EnvironmentContext> extends Chain<Params, ContextAdditions, EnvContext> {
    public async build(context: FrozenContext<EnvContext["init"]>): Promise<void> {
        return await this.execute(context)
    }
}
export abstract class Action<Params, ContextAdditions, EnvContext extends EnvironmentContext> extends Chain<Params, ContextAdditions, EnvContext> {
    protected async init(parameters: Params, context: FrozenContext<EnvContext["init"]>, callback: (context: Context<EnvContext["init"] & ContextAdditions>) => void): Promise<void> {
        callback(await this.run(parameters, context));
    }
    protected abstract run(parameters: Params, context: FrozenContext<EnvContext["init"]>): Promise<Context<EnvContext["init"] & ContextAdditions>>;
}
export abstract class Condition<Params, EnvContext extends EnvironmentContext> extends Chain<Params, {}, EnvContext> {
    protected async init(parameters: Params, context: FrozenContext<EnvContext["init"]>, callback: (context: Context<EnvContext["init"]>) => void): Promise<void> {
        if(await this.check(parameters, context))
            callback(context);
    }
    protected abstract check(parameters: Params, context: FrozenContext<EnvContext["init"]>): Promise<boolean>;
}
export abstract class Modifier<Params, ContextAdditions, EnvContext extends EnvironmentContext> extends Chain<Params, ContextAdditions, EnvContext> {

}