import { DiscordGuildModule } from "./discord/module";
import TheGateScenario from "./scenarios/the_gate";

new DiscordGuildModule({guildId: "888801480709128282", tokenKey: "discordBotToken"})
  .use(new TheGateScenario({channelId: "888801481896128524", baseRoleId: "1013378376230248488", additionalRoleIds: []}));