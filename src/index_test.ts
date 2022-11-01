import { worker } from "./core/module";
import { DiscordEnvContext, DiscordGuildModule } from "./discord/module";
import { OpenAIEnvContext, OpenAIModule } from "./openai/module";
import TheGateScenario from "./scenarios/the_gate";

worker()
  .using<DiscordEnvContext>(new DiscordGuildModule({guildId: "888801480709128282", tokenKey: "discordBotToken"}))
  .using<OpenAIEnvContext>(new OpenAIModule({tokenKey: "openAIApiToken", textModels: {high: "text-davinci-002", medium: "text-curie-001", low: "text-babbage-001"}}))
  
  .run(new TheGateScenario({channelId: "888801481896128524", baseRoleId: "1013378376230248488", additionalRoleIds: []}))