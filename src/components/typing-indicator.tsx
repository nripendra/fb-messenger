import * as React from "react";
import {Hbox} from "./layout";
const Avatar = require("material-ui/lib/avatar");

export class TypingIndicatorProps {
	currentFriend: any;
}

export default class TypingIndicator extends React.Component<TypingIndicatorProps, any> {
	constructor(props: TypingIndicatorProps) {
        super();
        this.props = props;
    }

	render() {
		var currentFriend = this.props.currentFriend;
		var justifyContent = 'flex-start';
		if (currentFriend.isTyping === true) {
			return (
				<Hbox style={{'justifyContent': justifyContent}}>
					<Avatar size={32} src={currentFriend.profilePicture} />
					<div className={"typing-indicator"}>
						<span></span>
						<span></span>
						<span></span>
					</div>
				</Hbox>);
		} else {
			return <span />;
		}
	}
}