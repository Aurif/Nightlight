import { CacheManager } from "./cache";

export type EnvironmentContext = {
    preinit?: {},
    init: {}
}
type ContextField<Context extends EnvironmentContext | {}, Field extends keyof EnvironmentContext> = Context extends EnvironmentContext ? Context[Field] : {};

export type InitContext<EnvContext extends EnvironmentContext | {}> = FrozenContext<GlobalContext["init"] & ContextField<EnvContext, "init">>
export type InitOutContext<EnvContext extends EnvironmentContext | {}, ContextAdditions> = FrozenContext<GlobalContext["init"] & ContextField<EnvContext, "init"> & ContextAdditions> | Context<GlobalContext["init"] & ContextField<EnvContext, "init"> & ContextAdditions>
export type LockedInitContext<EnvContext extends EnvironmentContext | {}> = LockedContext<GlobalContext["init"] & ContextField<EnvContext, "init">>
export type PreinitContext<EnvContext extends EnvironmentContext | {}> = FrozenContext<GlobalContext["preinit"] & ContextField<EnvContext, "preinit">>
export type PreinitOutContext<EnvContext extends EnvironmentContext | {}, ContextAdditions> = FrozenContext<GlobalContext["preinit"] & ContextField<EnvContext, "preinit"> & ContextAdditions> | Context<GlobalContext["preinit"] & ContextField<EnvContext, "preinit"> & ContextAdditions>

type Context<Fields extends {[name: string]: any}> = ContextClass<Fields> & {readonly [P in keyof Fields]: P extends "isFrozen" ? never : Fields[P]};
class ContextClass<Fields extends {[name: string]: any}> {
    public readonly _name : string = "global";
    public constructor(sourceContext?: ContextClass<Fields>, name?: string) {
        if(sourceContext)
            for(let key in sourceContext) {
                // @ts-ignore
                this[key] = sourceContext[key]
            }
        if(name)
            this._name = name;
    }

    public add<ValuesType extends {[name: string]: any}>(values: ValuesType): Context<Fields & ValuesType> {
        for(let key in values) {
            // @ts-ignore
            this[key] = values[key]
        }
        return this as ContextClass<Fields> as Context<Fields & ValuesType>
    }

    public freeze(name: string, id?: number): FrozenContext<Fields> {
        return new FrozenContextClass(this, getSubContextName(this._name, name, id)) as FrozenContext<Fields>
    }
}

type FrozenContext<Fields extends {[name: string]: any}> = FrozenContextClass<Fields> & {readonly [P in keyof Fields]: Fields[P]};
class FrozenContextClass<Fields extends {[name: string]: any}> extends ContextClass<Fields> {
    public readonly isFrozen = true;
    public add<ValuesType extends {[name: string]: any}>(values: ValuesType): Context<Fields & ValuesType> {
        let newContext = new ContextClass(this) as (Context<Fields & ValuesType>);
        newContext.add(values);
        return newContext;
    }
}
type LockedContext<Fields extends {[name: string]: any}> = {readonly [P in keyof Fields]: Fields[P]};

export function getSubContextName(previousName: string, name: string, id?: number) {
    return (previousName == "global"?"":previousName+".")+(id==undefined?"":`${(""+id).padStart(2, "0")}_`)+name;
}

type GlobalContext = {
    preinit: {cache: CacheManager},
    init: {}
}
type BuiltGlobalContext = {
    preinit: FrozenContext<GlobalContext["preinit"]>,
    init: FrozenContext<GlobalContext["init"]>
}
export function getGlobalContext(moduleName: string): BuiltGlobalContext {
    return {
        preinit: new ContextClass<{}>().add({cache: new CacheManager(moduleName)}).freeze("global"),
        init: new ContextClass<{}>().add({test: 3}).freeze("global")
    }
}