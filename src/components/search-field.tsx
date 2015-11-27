import * as React from "react";
import ChatAction from '../actions/chatactions';

const TextField = require('material-ui/lib/text-field');
const debounce = (global as any).electronRequire("lodash.debounce");

export default class SearchField extends React.Component<any, any> {
	constructor(props:any) {
		super();
		this.props = props;
		this.handleTextChange = debounce(this.handleTextChange, 500).bind(this);
	}
	
	handleTextChange() {
		ChatAction.filterFriendList((this.refs["searchField"] as any).getValue());
	}
	
	render() {
		let searchTextField = { width: '180px' };
		return <TextField ref="searchField" hintText="Search..." onChange={this.handleTextChange} style={searchTextField} />
	}
}