import { CacheManager } from "./cache";

export type Context<Fields extends {[name: string]: any}> = ContextClass<Fields> & {readonly [P in keyof Fields]: P extends "isFrozen" ? never : Fields[P]};
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

export type FrozenContext<Fields extends {[name: string]: any}> = FrozenContextClass<Fields> & {readonly [P in keyof Fields]: Fields[P]};
class FrozenContextClass<Fields extends {[name: string]: any}> extends ContextClass<Fields> {
    public readonly isFrozen = true;
    public add<ValuesType extends {[name: string]: any}>(values: ValuesType): Context<Fields & ValuesType> {
        let newContext = new ContextClass(this) as (Context<Fields & ValuesType>);
        newContext.add(values);
        return newContext;
    }

    // TODO: maybe do this implicitly? FrozenContext extends Context, but then the user may accidentaly return initial context instead of frozen one (not true - typecheck of context additions won't allow for that)
    public unfreeze(): Context<Fields> {
        return new ContextClass(this) as Context<Fields>;
    }
}

export function getSubContextName(previousName: string, name: string, id?: number) {
    return (previousName == "global"?"":previousName+".")+(id==undefined?"":`${(""+id).padStart(2, "0")}_`)+name;
}

export type GlobalContext = {
    preinit: {cache: CacheManager},
    init: {test: 3}
}
type BuiltGlobalContext = {
    preinit: Context<GlobalContext["preinit"]>,
    init: Context<GlobalContext["init"]>
}
export function getGlobalContext(moduleName: string): BuiltGlobalContext {
    return {
        preinit: new ContextClass<{}>().add({cache: new CacheManager(moduleName)}),
        init: new ContextClass<{}>().add({test: 3})
    }
}