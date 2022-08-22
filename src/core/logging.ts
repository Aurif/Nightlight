export enum logType {
    init = "|INIT|",
    run = "|RUN|",
    error = "!ERROR!",
}
export function log(message: string, type: logType) {
    console.log(type+" "+message);
}
export function logInit(message: string) {
    log(message, logType.init);
}
export function logRun(message: string) {
    log(message, logType.run);
}
export function logError(message: string) {
    log(message, logType.error);
}