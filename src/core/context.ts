export class GlobalContext {
    public readonly guildId: string;
    public constructor(guildId: string) {
        this.guildId = guildId;
    }

    public toLocal(): Context<{}> {
        return new ContextClass(this);
    }
    public add<ValuesType extends {[name: string]: number}>(values: ValuesType): Context<ValuesType> {
        return this.toLocal().add(values);
    }
}

export type Context<Fields extends {[name: string]: any}> = ContextClass<Fields> & {readonly [P in keyof Fields]: Fields[P]}
class ContextClass<Fields extends {[name: string]: any}> extends GlobalContext {
    public constructor(globalContext: GlobalContext) {
        super(globalContext.guildId)
    }
    public add<ValuesType extends {[name: string]: any}>(values: ValuesType): Context<Fields & ValuesType> {
        for(let key in values) {
            // @ts-ignore
            this[key] = values[key]
        }
        return this as unknown as (Context<Fields & ValuesType>)
    }
}