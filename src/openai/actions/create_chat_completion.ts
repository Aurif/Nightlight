import { InitContext, InitOutContext } from "../../core/context"
import { Action } from "../../core/logic"
import { OpenAIEnvContext } from "../module"

type Params = {
    prompt: {role: "system"|"user"|"assistant", content: string}[]
    user: string
}
type ContextAdditions = {
    promptCompletion: string
}

export default class CreateChatCompletionAction<EnvContext extends OpenAIEnvContext> extends Action<Params, ContextAdditions, EnvContext> {
    protected async run(parameters: Params, context: InitContext<EnvContext>): Promise<InitOutContext<EnvContext, ContextAdditions>> {
        let response: any
        try {
            response = await context.openAIApi.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: parameters.prompt,
                user: this.hashCode(parameters.user)
            });
        } catch (e) {
            let errorMessage = (e as any)?.response?.data?.error?.message;
            if (errorMessage) {
                return context.add({promptCompletion: errorMessage});
            }
            return context.add({promptCompletion: "An unknown error occured"});
        }
        return context.add({promptCompletion: response.data.choices[0].message.content || ""});
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