/// <reference path="../../typings/tsd.d.ts" />
import * as React from 'react';
import * as ReactDom from 'react-dom';

import {Hbox, Vbox} from './layout';
import MessageItem from './message-item';
import TypingIndicator from "./typing-indicator";

const Cards = require('material-ui/lib/card');
const Card = Cards.Card;
const CardHeader = Cards.CardHeader;
const CardActions = Cards.CardActions;
const CardText = Cards.CardText;
const CardMedia = Cards.CardMedia;
const ImageViewer = require("./image-viewer");

export class ConversationHistoryProps {
    messages: any;
    currentFriend: any;
	currentUser: any;
}

export default class ConversationHistory extends React.Component<ConversationHistoryProps, any> {
    private shouldScrollBottom: boolean;
    constructor(props: ConversationHistoryProps){
        super();
        this.props = props;
        this.shouldScrollBottom = false;
    }
    
    //@ref: http://blog.vjeux.com/2013/javascript/scroll-position-with-react.html
    componentWillUpdate() {
        var currentNode = ReactDom.findDOMNode(this) as any;
        this.shouldScrollBottom = (currentNode.scrollTop + currentNode.clientHeight) >= currentNode.scrollHeight;
    }
     
    componentDidUpdate() {
        if (this.shouldScrollBottom) {
            var node = ReactDom.findDOMNode(this);
            node.scrollTop = node.scrollHeight
        }
    }
    
    onImageViewerClose() {
        this.setState({open: false});    
    }
    
    onImageClick(imageInfo: {url:string; width:number; height:number; filename:string; open?: boolean}) {
        console.log("onImageClick %o", arguments);
        imageInfo.open = true;
        this.setState(imageInfo);
    }
    
    render() {
        var styles = {
            messageListScrollPane: {
                padding: '0 1.5em', 
                overflowX:'hidden',
                overflowY:'auto',
                height:'calc(100vh - 150px)', 
                maxHeight:'calc(100vh - 150px)',
                borderTop:'1px solid #ccc'
            },
            messageList: {
                minHeight: 'calc(100vh - 155px)',
                justifyContent: 'flex-end'
            }
        };
        var state = this.state || {};
        return (<CardText style={styles.messageListScrollPane}>
                    <Vbox style={styles.messageList}>
                        {this.renderMessages()}
                        <TypingIndicator currentFriend={this.props.currentFriend} />
                        <ImageViewer open={state.open} onRequestClose={this.onImageViewerClose.bind(this)} url={state.url} width={state.width} height={state.height} title={state.filename} />
                    </Vbox>
                </CardText>);
    }
    
    renderMessages(){
        var messages = this.props.messages;
        return messages.map((message: any) => this.renderMessageItem(message));
    }
    
    renderMessageItem(message: any) {
        var currentFriend = this.props.currentFriend;
        var currentUser = this.props.currentUser;
        return (<MessageItem message={message} currentUser={currentUser} currentFriend={currentFriend} onImageClick={this.onImageClick.bind(this)} />);
    }
}