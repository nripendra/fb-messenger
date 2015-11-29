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
		this.handleTextChange = this.handleTextChange.bind(this);
		this.handleOnBlur = this.handleOnBlur.bind(this);
		this.handleEnterKey = this.handleEnterKey.bind(this);
		this.handleMouseDown = this.handleMouseDown.bind(this);
		this.handleMouseUp = this.handleMouseUp.bind(this);
    }

	mouseDownTimer: any = null;
	likeSticker:number = 0;
	handleMouseDown() {
		var stickers = [369239263222822,// 35
			369239343222814,// 84
			369239383222810// 120
		];
		var i = 0;
		var interval = 800;
		this.likeSticker = stickers[i];
		console.log("sticker...%d", this.likeSticker);
		this.mouseDownTimer = setInterval(() => {
			i++;
			if (i > 2) {
				i = 0;
				this.likeSticker = 0;
				clearInterval(this.mouseDownTimer);
				console.log("sticker...%d", this.likeSticker);
			} else {
				this.likeSticker = stickers[i];
				console.log("sticker...%d", this.likeSticker);
			}
		}, interval);
	}

	handleMouseUp() {
		clearInterval(this.mouseDownTimer);
		console.log("final sticker...%d", this.likeSticker);
	}

	handleTextChange() {
		var message = (this.refs["messageField"] as any).getValue() || "";
		var threadID = this.props.currentFriend.userID;

		if (message.length > 0) {
			ChatActions.sendTypingIndicator(threadID);
		} else {
			ChatActions.endTypingIndicator(threadID);
		}
	}

	handleEnterKey(event: any) {
		if (event.shiftKey == false) {
			event.preventDefault();
			this.handleSendMessage();
		}
	}

	handleOnBlur() {
		var threadID = this.props.currentFriend.userID;
		this.props.onTextFieldBlur();
		ChatActions.endTypingIndicator(threadID);
	}

	handleSendMessage() {
		let threadID = this.props.currentFriend.userID;
		let message = { senderID: this.props.currentUser.userID, body: (this.refs["messageField"] as any).getValue() };
		ChatActions.sendMessage(threadID, message);
		ChatActions.endTypingIndicator(threadID);
		(this.refs["messageField"] as any).clearValue();
	}

	render() {
		return (<Hbox style={{ margin: 0, padding: 0 }}>
					<TextField
						ref="messageField"
						onEnterKeyDown={this.handleEnterKey}
						onFocus={this.props.onTextFieldFocus}
						onBlur={this.handleOnBlur}
						onChange={this.handleTextChange}
						hintText="Write a message..."
						multiLine={true}
						rows={1}
						rowsMax={2}
						style={{ flex: 2 }}></TextField>
					<IconButton onClick={this.handleSendMessage} ><FontIcon className="fa fa-paper-plane fa-2" /></IconButton>
					<IconButton onMouseDown={this.handleMouseDown} onMouseUp={this.handleMouseUp} ><FontIcon className="fa fa-thumbs-o-up fa-2" /></IconButton>
			</Hbox>);
	}
}