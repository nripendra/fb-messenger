import * as React from 'react';
import {Hbox, Vbox} from './layout';

export class FriendListProps {
    friendList: { [id: string] : any; } = {};//Dictionary<string, any>;
}

export default class FriendList extends React.Component<FriendListProps, any> {
    constructor(props: FriendListProps) {
        super();
        this.props = props;
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
        
        var friendlistStyle = {
            'overflow':'auto',
            'maxHeight':'calc(100vh - 8px)'
        };
        
        var friendList = Object.keys(this.props.friendList || []).map(id => this.props.friendList[id]);
        return (<div style={friendlistStyle}>
                  {friendList.map(function(friend) {
                      return (<Hbox>
                                <img src={friend.thumbSrc} style={state[friend.onlineState || 'offline']} />
                                {friend.name}
                          </Hbox>);
                  }) }
                  </div>);
    }
}
