import * as React from 'react';
import * as ReactDom from 'react-dom';

import {Hbox, Vbox} from './layout';

import ChatStore from '../stores/chatstore';
import ChatActions from '../actions/chatactions';
import AppStores from '../appstores';
import connectToStore from '../decorators/connectToStores';

import FriendList from './friendlist';
import Conversation from './conversation';

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
        var currentUser = AppStores.chatStore.friendList[AppStores.chatStore.currentUserId] || {id: ''};
        var messages = AppStores.chatStore.messages[currentFriend.id] || [];
        
        return (<Hbox>
                  <Vbox>
                    <FriendList friendList={friendList} currentFriend={currentFriend} />
                  </Vbox>
                  <Conversation messages={messages} currentUser={currentUser} currentFriend={currentFriend} />
            </Hbox>);
    }
}
