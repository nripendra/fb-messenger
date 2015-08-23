import {Store} from 'delorean';

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

    constructor() {
        super();
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
        console.log(this.credential);
        this.emit('change');
    }

    getState() {
        return { credential: this.credential, errors: this.errors };
    }
}
