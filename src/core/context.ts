export type Context<Fields extends {[name: string]: any}> = ContextClass<Fields> & {readonly [P in keyof Fields]: P extends "isFrozen" ? never : Fields[P]};
class ContextClass<Fields extends {[name: string]: any}> {
    public constructor(sourceContext?: ContextClass<Fields>) {
        if(sourceContext)
            for(let key in sourceContext) {
                // @ts-ignore
                this[key] = sourceContext[key]
            }
    }

    public add<ValuesType extends {[name: string]: any}>(values: ValuesType): Context<Fields & ValuesType> {
        for(let key in values) {
            // @ts-ignore
            this[key] = values[key]
        }
        return this as ContextClass<Fields> as Context<Fields & ValuesType>
    }

    public freeze(): FrozenContext<Fields> {
        return new FrozenContextClass(this) as FrozenContext<Fields>
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

    public freeze(): FrozenContext<Fields> {
        return this as FrozenContextClass<Fields> as FrozenContext<Fields>;
    }
}


const globalContext = (new ContextClass<{}>()).add({"log": console.log})
export type GlobalContext = typeof globalContext
export function getGlobalContext(): GlobalContext {return globalContext}