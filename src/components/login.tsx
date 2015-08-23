import * as React from 'react';
import LoginStore, {ICredential, ILoginErrors} from "../stores/loginstore";
import LoginActions from '../actions/loginactions';

export class LoginProps {
    store: LoginStore
}

export default class Login extends React.Component<LoginProps, any> {
    constructor(props: LoginProps) {
        super();
        this.props = props;
    }

    dologin() {
        var form = (React.findDOMNode(this.refs["loginForm"]) as HTMLFormElement);
        var txtUsername = (React.findDOMNode(this.refs["username"]) as HTMLInputElement);
        var txtPassword = (React.findDOMNode(this.refs["password"]) as HTMLInputElement);
        var username = txtUsername.value;
        var password = txtPassword.value;

        if (form.checkValidity()) {
            LoginActions.authenticate({ username, password });
        } else {
            LoginActions.setErrors({
                username: txtUsername.validationMessage,
                password: txtPassword.validationMessage,
                credential: ""
            });
        }
    }

    render() {
        var store = this.props.store;
        return (<form ref="loginForm">
                  <span ref="credentialError" dangerouslySetInnerHTML={{ __html: store.errors.credential }}></span>
                  <div>
                    <label>Username: </label>
                    <input type="email" required={true} ref="username" />
                    <span ref="usernameError" dangerouslySetInnerHTML={{ __html: store.errors.username }}></span>
                  </div>
                  <div>
                    <label>Password: </label>
                    <input type="password" required={true} ref="password" />
                    <span ref="passwordError"  dangerouslySetInnerHTML={{ __html: store.errors.password }}></span>
                  </div>
                  <div>
                    <input type="button" value="Login" ref="btnLogin" onClick={this.dologin.bind(this) } />
                  </div>
            </form>);
    }
}
