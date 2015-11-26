import * as React from "react";
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
		if (currentFriend.isTyping === true) {
			return (
				<div>
					<Avatar size={32} src={currentFriend.profilePicture} />
					<div className={"typing-indicator"}>
						<span></span>
						<span></span>
						<span></span>
					</div>
				</div>);
		} else {
			return <span />;
		}
	}
}