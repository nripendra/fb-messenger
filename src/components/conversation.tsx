import * as React from 'react';
import {Hbox, Vbox} from './layout';
import ConversationHistory from './conversation-history';
import SendMessageTextField from './send-message-text-field';
import ChatActions from "../actions/chatactions";

const Avatar = require('material-ui/lib/avatar');
const FontIcon = require('material-ui/lib/font-icon');
const IconButton = require('material-ui/lib/icon-button');
const TextField = require('material-ui/lib/text-field');
const Cards = require('material-ui/lib/card');
const Card = Cards.Card;
const CardHeader = Cards.CardHeader;
const CardActions = Cards.CardActions;
const CardText = Cards.CardText;
const CardMedia = Cards.CardMedia;


export class ConversationProps {
    messages: any;
    currentFriend: any;
    currentUser: any;
}

export default class Conversation extends React.Component<ConversationProps, any> {
    electronRequire: Function;
    isFocused: boolean;

    constructor(props: ConversationProps) {
        super();
        this.props = props;
        this.electronRequire = (global as any).electronRequire || function() { return; };
        this.handleTextFieldFocus = this.handleTextFieldFocus.bind(this);
        this.handleTextFieldBlur = this.handleTextFieldBlur.bind(this);
        this.hasUnreadMessage = this.hasUnreadMessage.bind(this);
        this.markAsReadIfNeeded = this.markAsReadIfNeeded.bind(this);
    }

    handleTextFieldFocus() {
        this.isFocused = true;
        this.markAsReadIfNeeded();
    }

    handleTextFieldBlur() {
        this.isFocused = false;
    }

    componentDidMount() {
        this.markAsReadIfNeeded();
    }

    componentDidUpdate(prevProps: any, prevState: any) {
        this.markAsReadIfNeeded();
    }

    markAsReadIfNeeded() {
        let messages = this.props.messages || [];
        if (messages.length > 0) {
            let remote = this.electronRequire("remote");
            let currentWindow = remote.getCurrentWindow();
            if (this.isFocused && currentWindow.isFocused() && this.hasUnreadMessage()) {
                console.log("marking as read");
                let currentFriend = this.props.currentFriend;
                ChatActions.markAsRead(currentFriend.userID);
            }
        }
    }

    hasUnreadMessage() {
        var messages = this.props.messages;
        var currentUser = this.props.currentUser;
        var needMarking: boolean = false;
        messages.forEach((m: any) => {
            if ((m.isSeen || false) === false && m.senderID !== currentUser.userID) {
                needMarking = true;
            }
            m.isSeen = true;
        });
        return needMarking;
    }

    render() {
        var styles = {
            rightPane: {
                flex: 2,
                height: "calc(100vh - 8px)",
                maxHeight: "calc(100vh - 8px)"
            }
        };

        var currentFriend = this.props.currentFriend || { userID: "" };
        var currentUser = this.props.currentUser;
        var messages = this.props.messages;

        return (<Card style={styles.rightPane}>
                    {this.renderHeader(currentFriend) }
                    <ConversationHistory messages={messages} currentUser={currentUser} currentFriend={currentFriend} />
                    <CardActions style={{ borderTop: "2px solid #CCC", padding: 0 }}>
                        <SendMessageTextField currentFriend={currentFriend}
                            currentUser={currentUser}
                            onTextFieldFocus = {this.handleTextFieldFocus}
                            onTextFieldBlur = {this.handleTextFieldBlur}
                        />
                    </CardActions>
            </Card>);
    }

    renderHeader(currentFriend: any) {
        return (<CardHeader title={currentFriend.fullName} avatar={<Avatar size={32} src={currentFriend.profilePicture} />} />);
    }
}
