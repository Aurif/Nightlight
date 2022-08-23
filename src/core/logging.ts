// TODO: add a way to log to a file
export function log(message: string) {
    console.log(message);
}
export function logInit(message: string, phase="INIT") {
    log(`|${phase}| ${message}`);
}
export function logRun(message: string) {
    log("|RUN| "+message);
}