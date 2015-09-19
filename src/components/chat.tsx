import * as React from 'react';
import ChatStore from '../stores/chatstore';
import ChatActions from '../actions/chatactions';
import {Hbox, Vbox} from './layout';
import AppStores from '../appstores';
import connectToStore from '../decorators/connectToStores';

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
        var state = {
            'online': {
                border: '1px solid gray',
                borderLeft: '3px solid green'
            },
            'offline': {
                border: '1px solid gray',
                borderLeft: '3px solid gray'
            }
        };
        var friendList = Object.keys(AppStores.chatStore.friendList || []).map(id => AppStores.chatStore.friendList[id]);
        return (<Hbox>
                  <Vbox>
                  {friendList.map(function(friend) {
                      return (<Hbox>
                                <img src={friend.thumbSrc} style={state[friend.onlineState || 'offline']} />
                                {friend.name}
                          </Hbox>);
                  }) }
                      </Vbox>
                  <Vbox></Vbox>
            </Hbox>);
    }
}
