import * as React from 'react';

import {Hbox, Vbox} from './layout';

import Emojify from './emojify';

const Avatar = require('material-ui/lib/avatar');

export class MessageItemProps {
    message: any;
    currentFriend: any;
	currentUser: any;
}

export class MessageContentProps {
	message: any;
	className: string;
}

export class MessageContent extends React.Component<MessageContentProps, any> {
	constructor(props: MessageContentProps) {
        super();
        this.props = props;
    }
	
	render() {
		if((this.props.message.attachments || []).length == 0) {
			if(this.props.message.sticker) {
				return <div style={this.getStickerStyle(this.props.message.sticker)}>
				</div>;
			} else {
				let justify = {'textAlign':'justify'};
				return (<div className={this.props.className} style={justify} >
					<Emojify messageText={this.props.message.body} />
				</div>);
			}
		} else {
			return (<div>
				{this.props.message.attachments.map((attachment:any) => {
					if(attachment.type == "sticker") {
						return (<img src={attachment.url} height={attachment.height} width={attachment.width} />);	
					}
					//empty div for now..
					return <div />
				})}
			</div>);
		}
	}
	
	getStickerStyle(stickerID: number) {
		// To-do: store this map externally, making stickers pluggable..
		var stickers = {
			"369239263222822" : {width: 35, height: 35, backgroundSize: "35px 35px", backgroundImage: "url(https://fbstatic-a.akamaihd.net/rsrc.php/ya/r/FwHVs2eE5cr.svg)", transition: "all 0.5s" },
			"369239343222814" : {width: 84, height: 84, backgroundSize: "84px 84px", backgroundImage: "url(https://fbstatic-a.akamaihd.net/rsrc.php/ya/r/FwHVs2eE5cr.svg)", transition: "all 0.5s" },
			"369239383222810" : {width: 120, height: 120, backgroundSize: "120px 120px", backgroundImage: "url(https://fbstatic-a.akamaihd.net/rsrc.php/ya/r/FwHVs2eE5cr.svg)", transition: "all 0.5s" }
		};
		return stickers[stickerID];
	}
}

export default class MessageItem extends React.Component<MessageItemProps, any> {
    constructor(props: MessageItemProps) {
        super();
        this.props = props;
    }

    render() {
        var currentFriend = this.props.currentFriend;
        var currentUser = this.props.currentUser;
        var message = this.props.message;
        
		var threadID = (message.senderID || "").toString();
		var leftAvatar:any = null;
		var rightAvatar:any = null;
		var rightAvatarStyle = {'marginLeft':'1.2em', 'marginRight':'-5px'};
		var leftAvatarStyle = {'marginRight':'1.2em', 'marginLeft':'-5px'};
		var className = '';
		var justifyContent = '';
		
		if(threadID == currentUser.userID) {
			className = 'callout right';
			justifyContent = 'flex-end';
			rightAvatar = <div style={rightAvatarStyle}><Avatar size={32} src={currentUser.profilePicture} /></div>;
		} else {
			className = 'callout left';
			justifyContent = 'flex-start';
			leftAvatar = <div style={leftAvatarStyle}><Avatar size={32} src={currentFriend.profilePicture} /></div>;
		}
		
		return (<Hbox style={{'justifyContent':justifyContent}}>
					{leftAvatar}
					<MessageContent className={className} message={message}  />
					{rightAvatar}
				</Hbox>);
    }
}
