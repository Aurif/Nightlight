import { Configuration, OpenAIApi } from 'openai';
import { InitContext, InitOutContext } from "../core/context";
import { Module } from "../core/module";
import { Secrets, SecretsKey } from '../core/utils/secrets';


type Preferences = {
    textModels: {
        high: string,
        medium: string,
        low: string
    }
}
type Params = Preferences & {
    tokenKey: SecretsKey
}
export type OpenAIEnvContext = {
    preinit: {},
    init: {
        openAIApi: OpenAIApi,
        openAIPreferences: Preferences
    }
}

export class OpenAIModule extends Module<Params, OpenAIEnvContext> {

    protected async init(context: InitContext<{}>, parameters: Params): Promise<InitOutContext<{}, OpenAIEnvContext["init"]>> {
        const openai = new OpenAIApi(new Configuration({
            apiKey: Secrets.get(parameters.tokenKey)
        }));
        
        return context.add({
            openAIApi: openai,
            openAIPreferences: Object.fromEntries(Object.entries(parameters).filter(([k, _v]) => (k!='tokenKey'))) as unknown as Preferences
        })
    }
}