import * as React from 'react';

import {Hbox, Vbox} from './layout';

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
			let justify = {'textAlign':'justify'};
			return (<div className={this.props.className} style={justify}>{this.props.message.body}</div>);
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
		
		if(threadID == currentUser.id) {
			className = 'callout right';
			justifyContent = 'flex-end';
			rightAvatar = <div style={rightAvatarStyle}><Avatar size={32} src={currentUser.thumbSrc} /></div>;
		} else {
			className = 'callout left';
			justifyContent = 'flex-start';
			leftAvatar = <div style={leftAvatarStyle}><Avatar size={32} src={currentFriend.thumbSrc} /></div>;
		}
		
		return (<Hbox style={{'justifyContent':justifyContent}}>
					{leftAvatar}
					<MessageContent className={className} message={message}  />
					{rightAvatar}
				</Hbox>);
    }
}
