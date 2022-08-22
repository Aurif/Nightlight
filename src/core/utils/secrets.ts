import secrets from "../../secrets";

export class Secrets {
    public static get(key: SecretsKey): string {
        return secrets[key];
    }
}
export type SecretsKey = keyof typeof secrets