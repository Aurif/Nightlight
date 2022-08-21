import { DiscordModule } from "./discord/module";
import { TestScenario } from "./scenarios";

new DiscordModule({guildId: "123"})
  .use(new TestScenario({intervals: [1000, 700]}));