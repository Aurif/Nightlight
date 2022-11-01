import { EnvironmentContext, InitContext, InitOutContext } from "../../core/context";
import { Action } from "../../core/logic"
import { ModelBase } from "../models/base";
import { ModelProxy } from "../utils/model_feedback";

type Params<ModelValueType> = {
    modelClass: ModelBase<ModelValueType>
}
type ContextAdditions<ModelValueType> = {
    model: ModelProxy<ModelValueType>
}

export default class StartModelFeedbackAction<EnvContext extends EnvironmentContext, ModelValueType> extends Action<Params<ModelValueType>, ContextAdditions<ModelValueType>, EnvContext> {
    protected async run(parameters: Params<ModelValueType>, context: InitContext<EnvContext>): Promise<InitOutContext<EnvContext, ContextAdditions<ModelValueType>>> {
        return context.add({model: new ModelProxy(parameters.modelClass)});
    }
}