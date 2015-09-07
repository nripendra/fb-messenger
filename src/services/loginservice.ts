let electronRequire: Function = (global as any).electronRequire || function () {
  
};

var login = electronRequire("facebook-chat-api");

export default class LoginService {
    authenticate(email: string, password: string): Promise<any> {
        return new Promise(function(resolve: Function, reject: Function) {
            login({ email, password }, function(err: any, api: any) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ email, password, api });
                }
            });
        });
    }
}
