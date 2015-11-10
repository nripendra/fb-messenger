import * as React from 'react';
import ChatStore from '../stores/chatstore';
import ChatActions from '../actions/chatactions';
import {Hbox, Vbox} from './layout';
import AppStores from '../appstores';
import connectToStore from '../decorators/connectToStores';
import FriendList from './friendlist';

const Avatar = require('material-ui/lib/avatar');
const FontIcon = require('material-ui/lib/font-icon');
const IconButton = require('material-ui/lib/icon-button');
const TextField = require('material-ui/lib/text-field');
const Paper = require('material-ui/lib/paper');
const Cards = require('material-ui/lib/card');
const Card = Cards.Card;
const CardHeader = Cards.CardHeader;
const CardActions = Cards.CardActions;
const CardText = Cards.CardText;
const CardMedia = Cards.CardMedia;
const List = require('material-ui/lib/lists/list');
const ListItem = require('material-ui/lib/lists/list-item');
const ListDivider = require('material-ui/lib/lists/list-divider');
const Colors = require('material-ui/lib/styles/colors');

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
        // for(var i = 0; i < 5; i++){
        //     messages.push({messageID:i, body : 'hello' + i})
        // }
        
        var rightPane =  {flex:2,
                          'height':'calc(100vh - 8px)', 
                          'maxHeight':'calc(100vh - 8px)'};
                          
        var messageListScrollPane = {'padding':'0 1.5em',
                                     'overflowX':'hidden',
                                     'overflowY':'auto',
                                     'height':'calc(100vh - 150px)', 
                                     'maxHeight':'calc(100vh - 150px)',
                                     'borderTop':'1px solid #ccc'
                                    };
                                     
        var messageList = {'minHeight': 'calc(100vh - 155px)',
                            'justifyContent':'flex-end'};
        
        return (<Hbox>
                  <Vbox>
                    <FriendList friendList={friendList} currentFriend={currentFriend} />
                  </Vbox>
                  <Card style={rightPane}>
                    <CardHeader title={currentFriend.name} avatar={<Avatar size={32} src={currentFriend.thumbSrc} />} />
                    <CardText style={messageListScrollPane}>
                            <Vbox style={messageList}>
                            {messages.map(function(message: any) {
                                    var avatarSrc = currentFriend.thumbSrc;
                                    var threadID = (message.senderID || "").toString();
                                    var leftAvatar:any = null;
                                    var rightAvatar:any = null;
                                    var rightAvatarStyle = {'marginLeft':'1.2em', 'marginRight':'-5px'};
                                    var leftAvatarStyle = {'marginRight':'1.2em', 'marginLeft':'-5px'};
                                    if(threadID == AppStores.chatStore.currentUserId) {
                                        avatarSrc = currentUser.thumbSrc;
                                        rightAvatar = <div style={rightAvatarStyle}><Avatar size={32} src={avatarSrc} /></div>;
                                    } else {
                                        leftAvatar = <div style={leftAvatarStyle}><Avatar size={32} src={avatarSrc} /></div>;
                                    }
                                var className = 'callout';
                                var justifyContent = 'flex-start';
                                if(leftAvatar == null){
                                    className += ' right';
                                    justifyContent = 'flex-end';
                                } else {
                                    className += ' left';
                                }
        
                                return (<Hbox style={{'justifyContent':justifyContent}}>
                                            {leftAvatar}
                                            <div className={className} style={{'textAlign':'justify'}}>{message.body}</div>
                                            {rightAvatar}
                                        </Hbox>);
                            })}
                            </Vbox>
                    </CardText>
                    <CardActions style={{borderTop:'2px solid #CCC', padding:0}}>
                        <Hbox style={{margin:0, padding:0}}>
                            <TextField hintText="Write a message..." multiLine={true} rows={1} rowsMax={2} style={{flex:2}}></TextField>
                            <IconButton><FontIcon className="fa fa-paper-plane fa-2" /></IconButton>
                        </Hbox>
                    </CardActions>
                  </Card>
            </Hbox>);
    }
}
