import * as React from 'react';
import {Hbox, Vbox} from './layout';
import ChatAction from '../actions/chatactions';

export class FriendListProps {
    friendList: { [id: string] : any; } = {};//Dictionary<string, any>;
    currentFriend: any;
}

export default class FriendList extends React.Component<FriendListProps, any> {
    constructor(props: FriendListProps) {
        super();
        this.props = props;
    }

    friendClicked(friend: any, event: any){
        ChatAction.friendSelected(friend);
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
            },
            'selected':{
                backgroundColor:'#6d84b4'
            }
        };
        
        var friendlistStyle = {
            'overflow':'auto',
            'maxHeight':'calc(100vh - 8px)'
        };
        
        var _this = this;
        var friendList = Object.keys(this.props.friendList || []).map(id => this.props.friendList[id]);
        return (<div style={friendlistStyle}>
                  {friendList.map(function(friend: any) {
                      var currentFriend = (_this.props.currentFriend || {id: ''});
                      var isCurrentFriend = friend.id == currentFriend.id;
                      var style = isCurrentFriend ? state.selected : {};
                      
                      return (<Hbox style={style} >
                                <div onClick={_this.friendClicked.bind(_this, friend)} >  
                                <img src={friend.thumbSrc} style={state[friend.onlineState || 'offline']} />
                                {friend.name}
                                </div>
                          </Hbox>);
                  })}
                  </div>);
    }
}
