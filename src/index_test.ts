import { DiscordGuildModule } from "./discord/module";
import SwarmPaletteGeneratorScenario from "./scenarios/swarm_palette_generator";

new DiscordGuildModule({guildId: "888801480709128282", tokenKey: "discordBotToken"})
  .use(new SwarmPaletteGeneratorScenario({}));