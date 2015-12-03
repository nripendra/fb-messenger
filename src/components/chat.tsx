import * as React from 'react';
import * as ReactDom from 'react-dom';

import {Hbox, Vbox} from './layout';

import ChatStore from '../stores/chatstore';
import ChatActions from '../actions/chatactions';
import AppStores from '../appstores';
import connectToStore from '../decorators/connectToStores';

import FriendList from './friendlist';
import Conversation from './conversation';
import ImageViewer from "./image-viewer";

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
        var currentFriend = AppStores.chatStore.currentFriend;
        var currentUser = AppStores.chatStore.currentUser;
        var messages = AppStores.chatStore.messages[currentFriend ? currentFriend.userID : ""] || [];
        var friendListFilterText = AppStores.chatStore.friendListFilterText;
        var image = AppStores.chatStore.imageToView;
        
        return (<Hbox>
                  <Vbox>
                    <FriendList friendList={friendList} currentFriend={currentFriend} friendListFilterText={friendListFilterText} />
                  </Vbox>
                  <Conversation messages={messages} currentUser={currentUser} currentFriend={currentFriend} />
                  <ImageViewer imageInfo={image} />
            </Hbox>);
    }
}
