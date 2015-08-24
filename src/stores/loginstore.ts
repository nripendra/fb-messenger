import {Store} from 'delorean';
import LoginService from '../services/loginservice';

export interface ICredential {
    username: string;
    password: string;
}

export interface ILoginErrors {
    username: string;//validation error for username
    password: string;//validation error for password
    credential: string;//both username/password satisfies the validation requirements but is not registerd credential in facebook
}

export default class LoginStore extends Store {
    credential: ICredential;
    errors: ILoginErrors;
    isAuthenticated: boolean;
    isInProgress: boolean;
    loginService: LoginService;

    constructor() {
        super();
        this.loginService = new LoginService();
        this.reset();
    }

    get actions() {
        return {
            'authenticate': 'doLogin',
            'setErrors': 'setErrors',
            'reset': 'reset'
        };
    }

    reset() {
        this.errors = { username: "", password: "", credential: "" };
        this.credential = { username: "", password: "" };
        this.emit('change');
    }

    setErrors(errors: ILoginErrors) {
        this.errors = errors;
        console.log(this.errors);
        this.emit('change');
    }

    doLogin(credential: ICredential) {
        this.errors = { username: "", password: "", credential: "" };
        this.credential = credential;
        this.isInProgress = true;
        this.emit('change');

        this.loginService.authenticate(this.credential.username, this.credential.password).then(function(response: any) {
            this.isAuthenticated = true;
            this.isInProgress = false;
            this.emit('change');
        }.bind(this)).catch(function(error: string) {
            this.isAuthenticated = false;
            this.isInProgress = false;
            this.errors = { username: "", password: "", credential: "Invalid username/password" };
            this.emit('change');
        }.bind(this));
    }

    getState() {
        return { credential: this.credential, errors: this.errors };
    }
}
