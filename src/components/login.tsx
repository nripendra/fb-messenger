import * as React from 'react';
import * as ReactDom from 'react-dom';
import LoginStore, {ICredential, ILoginErrors} from "../stores/loginstore";
import LoginActions from '../actions/loginactions';
import AppStores from '../appstores';
import {Style, Hbox, Vbox} from './layout';

const Avatar = require('material-ui/lib/avatar');
const FontIcon = require('material-ui/lib/font-icon');
const RaisedButton = require('material-ui/lib/raised-button');
const TextField = require('material-ui/lib/text-field');
const Cards = require('material-ui/lib/card');
const Card = Cards.Card;
const CardHeader = Cards.CardHeader;
const CardActions = Cards.CardActions;
const CardText = Cards.CardText;

const Colors = require('material-ui/lib/styles/colors');

export class LoginProps {
    store: LoginStore
}

export default class Login extends React.Component<LoginProps, any> {
    constructor(props: LoginProps) {
        super();
        this.props = props;
    }

    dologin() {

        var form = (ReactDom.findDOMNode(this.refs["loginForm"]) as HTMLFormElement);
        var txtUsername = (this.refs["username"] as any);
        var txtPassword = (this.refs["password"] as any);
        var username = txtUsername.getValue();
        var password = txtPassword.getValue();

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
        var cardStyle = {'display':'block','margin':'2px auto', 'width':'calc(100vw - 5px)', 'height':'calc(100vh - 5px)'};
        var centerAlignCard = {margin:'0 auto', width:'300px'};
        return (<Card style={cardStyle} initiallyExpanded={true}>
                    <div style={centerAlignCard}>
                    <CardHeader
                        title="Facebook"
                        titleStyle={{'fontSize':'1.5em'}}
                        subtitle="Login"
                        subtitleStyle={{'fontSize':'1.2em'}}
                        avatar={<Avatar backgroundColor={Colors.pink400} icon={<FontIcon className="fa fa-facebook" />}></Avatar>}
                        actAsExpander={false}
                        showExpandableButton={false}>
                    </CardHeader>
                    <CardText>
                        Enter the same username and password you use for login into facebook.
                    </CardText>
                    <CardActions expandable={false}>
                        <form ref="loginForm">
                            <Vbox>
                                <span style={error} ref="credentialError">{store.errors.credential}</span>
                                <Hbox>
                                <Vbox>
                                    <Hbox>
                                    <TextField required={true} hintText="Username" type="text" ref="username" floatingLabelText="Username:" errorText={store.errors.username} />
                                    </Hbox>
                                    <Hbox>
                                    <TextField required={true} hintText="Password" type="password" ref="password" floatingLabelText="Password:" errorText={store.errors.password} />
                                    </Hbox>
                                </Vbox>
                                </Hbox>
                                <Hbox>
                                <RaisedButton label={store.isInProgress ? "Login..." : "Login"} 
                                              ref="btnLogin" 
                                              disabled={store.isInProgress} 
                                              primary={true}  
                                              onClick={this.dologin.bind(this) }
                                              backgroundColor={Colors.teal600} />
                                </Hbox>
                            </Vbox>
                        </form>
                   </CardActions>
                   </div>
                </Card>);
    }
}
