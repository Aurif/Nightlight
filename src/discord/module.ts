import { Client, GatewayIntentBits, Guild, IntentsBitField } from 'discord.js';
import { Context, GlobalContext } from "../core/context";
import Module from "../core/module";
import { Secrets, SecretsKey } from '../core/utils/secrets';

type Params = {
    guildId: string,
    tokenKey: SecretsKey
}
export type DiscordEnvContext = {
    preinit: {
        registerIntent: (intent: GatewayIntentBits) => void
    },
    init: {
        discordGuild: Guild
    }
}

export class DiscordGuildModule extends Module<Params, DiscordEnvContext> {
    private intents: IntentsBitField = new IntentsBitField();
    protected async preinit(context: GlobalContext, _parameters: Params): Promise<Context<DiscordEnvContext["preinit"]>> {
        return context.add({"registerIntent": this.registerIntent.bind(this)});
    };
    private registerIntent(intent: GatewayIntentBits): void {
        this.intents.add(intent);
    }

    protected async init(context: Context<GlobalContext>, parameters: Params): Promise<Context<DiscordEnvContext['init']>> {
        const client = new Client({ intents: this.intents });
        client.login(Secrets.get(parameters.tokenKey));

        await new Promise((resolve) => {client.on('ready', resolve)});

        const guild = client.guilds.resolve(parameters.guildId)
        if(guild == undefined)
            throw new Error("Discord guild not found");

        return context.add({
            discordGuild: guild
        })
    }
}