import * as React from "react";
import {Hbox, Vbox} from "./layout";
import ChatActions from "../actions/chatactions";

const FontIcon = require("material-ui/lib/font-icon");
const IconButton = require("material-ui/lib/icon-button");
const TextField = require("material-ui/lib/text-field");
const Cards = require("material-ui/lib/card");
const Card = Cards.Card;
const CardHeader = Cards.CardHeader;
const CardActions = Cards.CardActions;
const CardText = Cards.CardText;
const CardMedia = Cards.CardMedia;

export class SendMessageTextFieldProps {
    currentFriend: any;
	currentUser: any;
	onTextFieldFocus: Function;
	onTextFieldBlur: Function;
}

export default class SendMessageTextField extends React.Component<SendMessageTextFieldProps, any> {
	constructor(props: SendMessageTextFieldProps) {
        super();
        this.props = props;
		this.handleSendMessage = this.handleSendMessage.bind(this);
    }

	handleSendMessage() {
		let threadID = this.props.currentFriend.userID;
		let message = { body: (this.refs["messageField"] as any).getValue() };
		ChatActions.sendMessage(threadID, message)
	}

	render() {
		return (<Hbox style={{ margin: 0, padding: 0 }}>
					<TextField
						ref="messageField"
						onFocus={this.props.onTextFieldFocus}
						onBlur={this.props.onTextFieldBlur}
						hintText="Write a message..."
						multiLine={true}
						rows={1}
						rowsMax={2}
						style={{ flex: 2 }}></TextField>
					<IconButton onClick={this.handleSendMessage} ><FontIcon className="fa fa-paper-plane fa-2" /></IconButton>
			</Hbox>);
	}
}