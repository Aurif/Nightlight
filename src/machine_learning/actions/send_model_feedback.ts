import { EnvironmentContext, InitContext, InitOutContext } from "../../core/context";
import { Action } from "../../core/logic"
import { ModelProxy } from "../utils/model_feedback";

type Params = {
    model: ModelProxy<unknown>,
    feedbackValue: number
}
type ContextAdditions = {
}

export default class SendModelFeedbackAction<EnvContext extends EnvironmentContext> extends Action<Params, ContextAdditions, EnvContext> {
    protected async run(parameters: Params, context: InitContext<EnvContext>): Promise<InitOutContext<EnvContext, ContextAdditions>> {
        parameters.model.returnFeedback(parameters.feedbackValue);
        return context
    }
}