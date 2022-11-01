import { ScenarioCreator, Scenario } from "../core/scenario";
import EditMessageAction from "../discord/actions/edit_message";
import ReplyToInteractionAction from "../discord/actions/reply_to_interaction";
import MessageReactionButtonsModifier from "../discord/modifiers/message_reaction_buttons";
import { DiscordEnvContext } from "../discord/module";
import CommandTrigger from "../discord/triggers/command";
import SendModelFeedbackAction from "../machine_learning/actions/send_model_feedback";
import StartModelFeedbackAction from "../machine_learning/actions/start_model_feedback";
import { ModelBase, valueWithFeedback } from "../machine_learning/models/base";

type Params = {
}

class PaletteGenerator extends ModelBase<number> {
    value: number = 0;

    getForFeedback(): valueWithFeedback<number> {
        return {
            value: this.value,
            feedback: (feedback: number)=>{this.value += feedback}
        }
    }
}

export default class SwarmPaletteGeneratorScenario<EnvContext extends DiscordEnvContext> extends Scenario<Params, EnvContext> {
    public do(_parameters: Params, create: ScenarioCreator<EnvContext>): void {
        let paletteGenerator = new PaletteGenerator();
        create.on(new CommandTrigger({commandName: "palette_generator", commandDescription: "Launches a color palette generator based on a genetic swarm algorithm"}))
              .do(new StartModelFeedbackAction({modelClass: paletteGenerator}))
              .do(new ReplyToInteractionAction(ctx => ({message: `The current color is ${ctx.model.getCurrentValue()}`, replyTo: ctx.commandInteraction})))
              .with(new MessageReactionButtonsModifier(ctx => ({message: ctx.interactionReply, buttons: {
                0: "914979456492396544",
                1: "865707116073451531",
                2: "865707116220383232",
                3: "865707116407816202",
                4: "914182866131357697",
              }})))
              .do(new SendModelFeedbackAction(ctx => ({model: ctx.model, feedbackValue: parseInt(ctx.pressedEmote)/2-1})))
              .do(new EditMessageAction(ctx => ({toEdit: ctx.interactionReply, message: `The current color is ${ctx.model.getCurrentValue()}`})))
    }
    
}