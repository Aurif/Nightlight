import { ModelBase, valueWithFeedback } from "../models/base";

export class ModelProxy<T> {
    private readonly sourceModel: ModelBase<T>;
    private currentValue: valueWithFeedback<T> | null = null;
    constructor(sourceModel: ModelBase<T>) {
        this.sourceModel = sourceModel
    }

    getCurrentValue(): T {
        if(!this.currentValue)
            this.currentValue = this.sourceModel.getForFeedback()
        return this.currentValue.value;
    }
    returnFeedback(feedback: number) {
        if(!this.currentValue) throw "Can't give feedback if value wasn't read"
        this.currentValue.feedback(Math.min(1, Math.max(0, feedback)))
        this.currentValue = null
    }

}