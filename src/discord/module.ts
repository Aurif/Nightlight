import { Client, Guild, IntentsBitField } from 'discord.js';
import { Context, GlobalContext } from "../core/context";
import Module from "../core/module";
import { Secrets, SecretsKey } from '../core/utils/secrets';

type Params = {
    guildId: string,
    tokenKey: SecretsKey
}
type EnvContext = {
    discordGuild: Guild
}

export class DiscordGuildModule extends Module<Params, EnvContext> {
    protected async init(context: GlobalContext, parameters: Params): Promise<Context<EnvContext>> {
        const myIntents = new IntentsBitField();
        myIntents.add(IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.MessageContent, IntentsBitField.Flags.GuildMessages);

        const client = new Client({ intents: myIntents });
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