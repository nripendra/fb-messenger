import * as React from 'react';
import {Hbox, Vbox} from './layout';
import ChatAction from '../actions/chatactions';
import AppStores from '../appstores';

const Popover = require('./popover');
const Avatar = require('material-ui/lib/avatar');
const AppBar = require('material-ui/lib/app-bar');
const TextField = require('material-ui/lib/text-field');
const FontIcon = require('material-ui/lib/font-icon');
const IconButton = require('material-ui/lib/icon-button');
const IconMenu = require('material-ui/lib/menus/icon-menu');
const List = require('material-ui/lib/lists/list');
const ListItem = require('material-ui/lib/lists/list-item');
const ListDivider = require('material-ui/lib/lists/list-divider');
const MenuItem = require('material-ui/lib/menus/menu-item');
const MenuDivider = require('material-ui/lib/menus/menu-divider');
const MoreVertIcon = require('material-ui/lib/svg-icons/navigation/more-vert');
const Toolbar = require('material-ui/lib/toolbar/toolbar');
const ToolbarGroup = require('material-ui/lib/toolbar/toolbar-group');
const ToolbarSeparator = require('material-ui/lib/toolbar/toolbar-separator');

const Cards = require('material-ui/lib/card');
const Card = Cards.Card;
const CardHeader = Cards.CardHeader;
const CardActions = Cards.CardActions;
const CardText = Cards.CardText;
const CardMedia = Cards.CardMedia;

var injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();

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
            'active': {
                position:'absolute',
                bottom:2,
                right:0,
                border:'1px solid green',
                display:'inline-block',
                width:10,
                height:10,
                borderRadius:'50%',
                backgroundColor:'green'
            },
            'offline': {
                position:'absolute',
                bottom:2,
                right:0,
                border:'1px solid gray',
                display:'inline-block',
                width:10,
                height:10,
                borderRadius:'50%',
                backgroundColor:'gray'
            },
            'idle': {
                position:'absolute',
                bottom:2,
                right:0,
                border:'1px solid yellow',
                display:'inline-block',
                width:10,
                height:10,
                borderRadius:'50%',
                backgroundColor:'yellow'
            },
            'invisible': {
                position:'absolute',
                bottom:2,
                right:0,
                border:'1px solid gray',
                display:'inline-block',
                width:10,
                height:10,
                borderRadius:'50%',
                backgroundColor:'gray'
            },
            'selected':{
                backgroundColor:'#6d84b4'
            }
        };
        
        var friendlistStyle = {
            'overflow':'auto',
            'padding-top':0,
            'maxHeight':'calc(100vh - 63px)'
        };
        
        var _this = this;
        var friendList = Object.keys(this.props.friendList || [])
                               .map((id) => {
                                   var f = this.props.friendList[id] as any;
                                   f.id = id;
                                   return f;
                               }).sort((x,y) => { 
                                   var xMessage: any = (AppStores.chatStore.messages[x.id] || []);
                                       var yMessage: any = (AppStores.chatStore.messages[y.id] || []);
                                       if(xMessage.length > 0) {
                                           xMessage = xMessage[xMessage.length - 1];
                                       } else {
                                           xMessage = {timestamp: 0};
                                       }
                                       
                                       if(yMessage.length > 0) {
                                           yMessage = yMessage[yMessage.length - 1];
                                       } else {
                                           yMessage = {timestamp: 0};
                                       }
                                       
                                       var diff = yMessage.timestamp - xMessage.timestamp;
                                       if(diff == 0) {
                                            var presencePriority = {'active': 3, 'idle': 2, 'invisible': 1, 'offline': 0 };
                                            var presence1 = (presencePriority[((x.presence || {statuses: {status: 'offline'}}).statuses ||  {status: 'offline'}).status]) || 0;
                                            var presence2 = (presencePriority[((y.presence || {statuses: {status: 'offline'}}).statuses ||  {status: 'offline'}).status]) || 0;
                                            if(presence1 == presence2) {
                                                return x.name.localeCompare(y.name); 
                                            } else {
                                                return presence2 - presence1;
                                            }       
                                       }
                                       return diff;
                               })
                               .filter(x => x.isFriend === true);
        return (<div style={{'height':'calc(100vh - 8px)', 'maxHeight':'calc(100vh - 8px)'}}>
                 <Toolbar>
                    <ToolbarGroup key={0} float="left">
                        <TextField hintText="Search..." style={{width:'180px'}} />
                    </ToolbarGroup>
                    <ToolbarGroup key={1} float="right">
                        <ToolbarSeparator/>
                        <Popover listStyle={{background:'#C7C3C3', left:'calc(50% - 10.2em)'}} 
                                 iconButtonElement={<IconButton><FontIcon className="fa fa-bell notification" /></IconButton>}
                                 openDirection='bottom-right'
                                >
                             <ListItem
                                leftAvatar={<Avatar>F</Avatar>}
                                primaryText="Brendan Lim"
                                secondaryText={
                                <p>
                                    I'll be in your neighborhood doing errands this weekend. Do you want to grab brunch?
                                </p>
                                } />
                        </Popover>
                        <IconButton><FontIcon className="fa fa-sign-out" /></IconButton>
                    </ToolbarGroup>
                </Toolbar>
                <ListDivider />
                <List style={friendlistStyle}>
                  {friendList.map(function(friend: any) {
                      var currentFriend = (_this.props.currentFriend || {id: ''});
                      var isCurrentFriend = friend.id == currentFriend.id;
                      var style = isCurrentFriend ? state.selected : {};
                      var presence = ((friend.presence || {statuses: {status: 'offline'}}).statuses ||  {status: 'offline'}).status;
                      return (<ListItem 
                                leftAvatar={<div><Avatar  size={32} src={friend.thumbSrc} /><span style={state[presence || 'offline']}></span></div>}
                                style={style} 
                                onClick={_this.friendClicked.bind(_this, friend)}
                                primaryText={friend.name}>
                          </ListItem>);
                  })}
                  </List>
                  </div>);
    }
}
