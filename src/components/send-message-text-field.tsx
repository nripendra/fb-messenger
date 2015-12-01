/// <reference path="../../typings/tsd.d.ts" />
import * as React from "react";
import {Hbox, Vbox} from "./layout";
import ChatActions from "../actions/chatactions";
import emoji from "../services/emoji-map";

const FontIcon = require("material-ui/lib/font-icon");
const IconButton = require("material-ui/lib/icon-button");
const TextField = require("material-ui/lib/text-field");
const Cards = require("material-ui/lib/card");
const Card = Cards.Card;
const CardHeader = Cards.CardHeader;
const CardActions = Cards.CardActions;
const CardText = Cards.CardText;
const CardMedia = Cards.CardMedia;
const ListItem = require('material-ui/lib/lists/list-item');
const Paper = require('material-ui/lib/paper');
const Popover = require('material-ui/lib/popover/popover');

export class SendMessageTextFieldProps {
    currentFriend: any;
	currentUser: any;
	onTextFieldFocus: Function;
	onTextFieldBlur: Function;
}

export default class SendMessageTextField extends React.Component<SendMessageTextFieldProps, any> {
	emojies:string;
	constructor(props: SendMessageTextFieldProps) {
        super();
        this.props = props;
		this.emojies = `😄,😃,😊,☺,😉,😍,😘,😚,😜,😝,😳,😁,😔,😌,😒,😞,😣,😢,😂,😭,😪,😥,😰,😓,😩,😫,😨,😱,😠,😡,😤,😖,😆,😷,😵,😲,
		👿,😏,👲,👳,👮,👷,💂,👶,👦,👧,👨,👩,👴,👵,👱,👼,👸,
		💛,💙,💜,💚,❤,💔,💗,💓,💖,💞,💘,💌,💋,💍,💎,
		💐,🌸,🌷,🍀,🌹,🌻,🌺,🍁,🍃,🍂,🌾,🌵,🌴,🌱,
		🐶,🐺,🐱,🐭,🐹,🐰,🐸,🐯,🐨,🐻,🐷,🐮,🐗,🐵,🐒,
		🐴,🐑,🐘,🐧,🐦,🐥,🐔,🐍,🐛,🐙,🐚,🐠,🐟,🐬,🐳,🐎,🐡,🐫,🐩,🐾,
		🎩,👑,👒,👟,👡,👠,👢,👕,👔,👗,👘,👙,🌂,💄,💼,👜,🎀,🎍,💝,🎎,🎒,🎓,🎏,🎐,🎃,👻,🎅,🎄,🎁,	🎉,🎈,🎌,
		🎥,📷,	📼,	💿,	📀,	💽,	💾,	💻,	📱,	☎,📞,📠,📡,📺,📻,🔈,🔔,📢,📣,
		🔓,🔒,🔏,🔐,🔑,	🔎,💡,🔍,🛀,🚽,🔨,🚬,💣,🔫,💊,💉,💰,💴,💵,📲,
		☕,🍵,🍶,🍺,🍻,🍸,🍴,🍔,🍟,🍝,🍛,🍱,🍣,🍙,🍘,🍚,🍜,🍲,🍢,🍡, 🍳,🍞,🍦,🍧,🍰,🍎,🍊,🍉,🍓,🍆,🍅,
		⛵,🚤,🚀,✈,💺,🚉,🚄,🚅,🚃,🚌,🚙,🚗,🚕,🚚,🚓,🚒,🚑,🚲,💈,🚏,🎫,🚥,⚠,🚧,🔰,⛽,♨,
		🎭, 🏠, 🏡,🏫,🏢,🏣,🏥,🏦,🏪,🏩,🏨,💒,⛪,🏬,🌇,🌆,🏯,🏰,⛺,🏭,🗼,🗻,🌄,🌅,🌃,🗽,🎡,⛲,🎢,🚢,
		🎨,🎬,🎤,🎧,🎼,🎵,🎶,🎺,🎷,🎸,🌙,⭐,☀,☁,⚡,☔,⛄,🌀,🌈,🌊,✉,📩,📨,📫,📪,📬,📭,📮,📝,✂,📖,
		👾,🀄,🎯,🏈,🏀,⚽,⚾,🎾,🎱,⛳,🏁,🏆,🎿,👎,👌,💀,👽,🐼,👍,🔥,✨,🌟,💢,💦,💧,💤,💨,👂,👀,👃,👅,👄`;
		this.handleSendMessage = this.handleSendMessage.bind(this);
		this.handleTextChange = this.handleTextChange.bind(this);
		this.handleOnBlur = this.handleOnBlur.bind(this);
		this.handleEnterKey = this.handleEnterKey.bind(this);
		this.handleLikeButtonMouseDown = this.handleLikeButtonMouseDown.bind(this);
		this.handleLikeButtonMouseUp = this.handleLikeButtonMouseUp.bind(this);
		this.handleEmojiOpen = this.handleEmojiOpen.bind(this);
		this.handleEmojiClose = this.handleEmojiClose.bind(this);
    }

	mouseDownTimer: any = null;
	likeSticker:number = 0;
	handleLikeButtonMouseDown() {
		var threadID = this.props.currentFriend.userID;
		var stickers = [369239263222822,// 35
			369239343222814,// 84
			369239383222810// 120
		];
		var i = 0;
		var interval = 800;
		this.likeSticker = stickers[i];
		console.log("sticker...%d", this.likeSticker);
		ChatActions.enqueueLikeSticker(threadID, this.likeSticker);
		this.mouseDownTimer = setInterval(() => {
			i++;
			if (i > 2) {
				i = 0;
				this.likeSticker = 0;
				clearInterval(this.mouseDownTimer);
				console.log("sticker...%d", this.likeSticker);
				ChatActions.enqueueLikeSticker(threadID, this.likeSticker);
			} else {
				this.likeSticker = stickers[i];
				console.log("sticker...%d", this.likeSticker);
				ChatActions.enqueueLikeSticker(threadID, this.likeSticker);
			}
		}, interval);
	}

	handleLikeButtonMouseUp() {
		var threadID = this.props.currentFriend.userID;
		clearInterval(this.mouseDownTimer);
		console.log("final sticker...%d", this.likeSticker);
		ChatActions.finalizeLikeSticker(threadID, this.likeSticker);
	}
	
	handleEmojiOpen(event: any) {
		this.setState({showEmojiPanel: true, 
			anchorEl: event.currentTarget,
			anchorOrigin:{horizontal:'left', vertical:'top'},
      		targetOrigin:{horizontal:'left', vertical:'top'}
		});
	}
	
	handleEmojiClose() {
		this.setState({showEmojiPanel: false});
	}
	
	handleAddEmoji(emoji: string){
		var message = ((this.refs["messageField"] as any).getValue() || "") + emoji;
		(this.refs["messageField"] as any).setValue(message);
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
		var state = this.state || {};
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
						style={{ flex: 2, fontFamily: "'Segoe UI Emoji', 'Segoe UI Symbol'" }}></TextField>
					<IconButton onClick={this.handleSendMessage} ><FontIcon className="fa fa-paper-plane fa-2" /></IconButton>
					 <Popover open={state.showEmojiPanel === true}
						anchorEl={state.anchorEl}
						anchorOrigin={state.anchorOrigin}
						targetOrigin={state.targetOrigin}
						onRequestClose={this.handleEmojiClose} 
						style={{width:400, height:400}}
						>
						<div style={{padding:20}}>
						{this.emojies.split(",").map((x) => {
									return <IconButton onClick={this.handleAddEmoji.bind(this, x)} iconClassName={'em emj'+ emoji[x]}><span style={{display: "none"}}>{x}</span></IconButton>
								 })}
						</div>
					</Popover>
					<IconButton onClick={this.handleEmojiOpen}><FontIcon className="fa fa-smile-o notification" /></IconButton>
					<IconButton onMouseDown={this.handleLikeButtonMouseDown} onMouseUp={this.handleLikeButtonMouseUp} ><FontIcon className="fa fa-thumbs-o-up fa-2" /></IconButton>
			</Hbox>);
	}
}