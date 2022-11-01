import { worker } from "./core/module";
import { DiscordEnvContext, DiscordGuildModule } from "./discord/module";
import { OpenAIEnvContext, OpenAIModule } from "./openai/module";
import MessageMoverScenario from "./scenarios/message_mover";
import TheGateScenario from "./scenarios/the_gate";

worker()
  .using<DiscordEnvContext>(new DiscordGuildModule({guildId: "812785611693490212", tokenKey: "discordBotToken"}))
  .using<OpenAIEnvContext>(new OpenAIModule({tokenKey: "openAIApiToken", textModels: {high: "text-davinci-002", medium: "text-curie-001", low: "text-babbage-001"}}))
  
  .run(new TheGateScenario({channelId: "945747669182210078", baseRoleId: "812786551242883143", additionalRoleIds: ["943935923035467826"]}))
  .run(new MessageMoverScenario({}))