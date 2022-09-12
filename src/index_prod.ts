import { DiscordGuildModule } from "./discord/module";
import MessageMoverScenario from "./scenarios/message_mover";
import TheGateScenario from "./scenarios/the_gate";

new DiscordGuildModule({guildId: "812785611693490212", tokenKey: "discordBotToken"})
  .use(new TheGateScenario({channelId: "945747669182210078", baseRoleId: "812786551242883143", additionalRoleIds: ["943935923035467826"]}))
  .use(new MessageMoverScenario({}))