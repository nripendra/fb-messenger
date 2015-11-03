import * as React from 'react';
import ChatStore from '../stores/chatstore';
import ChatActions from '../actions/chatactions';
import {Hbox, Vbox} from './layout';
import AppStores from '../appstores';
import connectToStore from '../decorators/connectToStores';
import FriendList from './friendlist';

export class ChatProps {
    api: any;
    store: ChatStore
}

@connectToStore(['chatStore'])
export default class Chat extends React.Component<ChatProps, any> {
    constructor(props: ChatProps) {
        super();
        this.props = props;
        ChatActions.initApi(this.props.api);
    }

    render() {
        var friendList = AppStores.chatStore.friendList;
        var currentFriend = AppStores.chatStore.currentFriend || {id: ''};
        var messages = AppStores.chatStore.messages[currentFriend.id] || [];
        return (<Hbox>
                  <Vbox>
                  <FriendList friendList={friendList} currentFriend={currentFriend} />
                  </Vbox>
                  <Vbox>
                  {messages.map(function(message: any) {
                    return (<div key={message.messageID} className="callout-in">{message.body}</div>);
                  })}
                  <textarea></textarea>
                  </Vbox>
            </Hbox>);
    }
}
