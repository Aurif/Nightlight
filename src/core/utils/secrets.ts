var secrets = {}

try {
    secrets = require("../../secrets")['default'];
} catch {
    console.log("Couldn't load secrets")
}

export class Secrets {
    public static get(key: SecretsKey): string {
        return secrets[key as keyof typeof secrets];
    }
}
export type SecretsKey = string