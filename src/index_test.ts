import { DiscordGuildModule } from "./discord/module";
import MessageMoverScenario from "./scenarios/message_mover";

new DiscordGuildModule({guildId: "888801480709128282", tokenKey: "discordBotToken"})
  .use(new MessageMoverScenario({}));