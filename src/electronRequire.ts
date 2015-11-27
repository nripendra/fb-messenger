var electronRequire:Function = (global as any).electronRequire || (global as any).require || ((moduleName:string) => { return; });
export default electronRequire;