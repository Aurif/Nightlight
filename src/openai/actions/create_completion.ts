import { InitContext, InitOutContext } from "../../core/context"
import { Action } from "../../core/logic"
import { OpenAIEnvContext } from "../module"

type Params = {
    prompt: string
    modelType?: "high"|"medium"|"low"
    user: string
}
type ContextAdditions = {
    promptCompletion: string
}

export default class CreateCompletionAction<EnvContext extends OpenAIEnvContext> extends Action<Params, ContextAdditions, EnvContext> {
    protected async run(parameters: Params, context: InitContext<EnvContext>): Promise<InitOutContext<EnvContext, ContextAdditions>> {
        let response: any
        try {
            response = await context.openAIApi.createCompletion({
                model: context.openAIPreferences.textModels[parameters.modelType || "medium"],
                prompt: parameters.prompt,
                temperature: 0,
                max_tokens: 120,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
                user: this.hashCode(parameters.user)
            });
        } catch (e) {
            let errorMessage = (e as any)?.response?.data?.error?.message;
            if (errorMessage) {
                return context.add({promptCompletion: errorMessage});
            }
            return context.add({promptCompletion: "An unknown error occured"});
        }
        return context.add({promptCompletion: response.data.choices[0].text || ""});
    }

    private hashCode(str: string): string {
        let hash = 0;
        for (let i = 0, len = str.length; i < len; i++) {
            let chr = str.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash.toString();
    }
}