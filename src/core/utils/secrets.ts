import secrets from "../../secrets";

export class Secrets {
    public static get(key: SecretsKey): string {
        return secrets[key as keyof typeof secrets];
    }
}
export type SecretsKey = string