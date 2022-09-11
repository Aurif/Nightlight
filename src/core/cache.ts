class TempCache<T> {
    private static cache: Record<string, Record<string, any>> = {};

    private readonly key: string;
    constructor(key: string) {
        this.key = key;
        TempCache.cache[key] = {};
    }

    public get(key: string): T {
        return TempCache.cache[this.key][key];
    }
    public set(key: string, value: T): void {
        TempCache.cache[this.key][key] = value;
    }
}
export class CacheManager {
    private readonly key: string;
    constructor(key: string) {
        this.key = key;
    }
    public make<T>(subkey: string): TempCache<T> {
        return new TempCache(this.key + "." + subkey.replace(/\./g, "_"));
    }
}