import * as React from "react";
import {context, playNote} from "../services/playNote";
import electronRequire from "../electronRequire";
import ChatActions from "../actions/chatactions";

export default class Beeper extends React.Component<any, any> {
    render() : JSX.Element {
		let remote = electronRequire("remote");
		let currentWindow = remote.getCurrentWindow();
		if (this.props.playNewMessageBeep) {
			this.playNewMessageNote();
			ChatActions.resetPlayNewMessageBeep();
		}
        return null;
    }
	
	playNewMessageNote() {
		// Play a 'B' now that lasts for 0.116 seconds
		playNote(493.883, context.currentTime, 0.116);

		// Play an 'E' just as the previous note finishes, that lasts for 0.232 seconds
		playNote(659.255, context.currentTime + 0.116, 0.232);
	}
}
