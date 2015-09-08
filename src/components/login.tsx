import * as React from 'react';
import LoginStore, {ICredential, ILoginErrors} from "../stores/loginstore";
import LoginActions from '../actions/loginactions';
import AppStores from '../appstores';
import {Style, Hbox, Vbox} from './layout';

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
        var loginButton = {marginLeft: 77};
        var error = {marginLeft: 5, color: '#cc0000'};
        return (<form ref="loginForm">
                  <Vbox>
                    <span style={error} ref="credentialError">{store.errors.credential}</span>
                    <Hbox>
                      <Vbox>
                        <label>Username: </label>
                        <label>Password: </label>
                      </Vbox>
                      <Vbox>
                        <Hbox>
                          <input type="email" required={true} ref="username" />
                          <span style={error} ref="usernameError">{store.errors.username}</span>
                        </Hbox>
                        <Hbox>
                          <input type="password" required={true} ref="password" />
                          <span style={error} ref="passwordError">{store.errors.password}</span>
                        </Hbox>
                      </Vbox>
                    </Hbox>
                    <Hbox>
                      <input style={loginButton} type="button" value="Login" ref="btnLogin" onClick={this.dologin.bind(this) } />
                    </Hbox>
                  </Vbox>
            </form>);
    }
}
