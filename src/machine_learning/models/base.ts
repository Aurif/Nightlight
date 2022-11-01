export abstract class ModelBase<T> {
    abstract getForFeedback(): valueWithFeedback<T>;
}

export type valueWithFeedback<T> = {
    value: T,
    feedback: (feedback: number)=>void
}