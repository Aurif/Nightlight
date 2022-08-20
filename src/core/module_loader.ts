import { GlobalContext } from "./context";

export class ModuleLoader {
    private globalContext: GlobalContext;
    public constructor(globalContext: GlobalContext) {
        this.globalContext = globalContext;
    }

    public use(module: Module): void {
        module.build(this.globalContext);
    }
}
export function forGuild(guildId: string): ModuleLoader {
    return new ModuleLoader(new GlobalContext(guildId));
}

export interface Module {
    build(globalContext: GlobalContext): void;
}