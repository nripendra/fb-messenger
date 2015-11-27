import * as React from 'react';
import {Hbox, Vbox} from './layout';
import ChatAction from '../actions/chatactions';
import SearchField from "./search-field"
import sortAndFilterFriendList from "../decorators/sortAndFilterFriendList";

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
    friendList: Array<any>;
    currentFriend: any;
    friendListFilterText: string;
}

@sortAndFilterFriendList
export default class FriendList extends React.Component<FriendListProps, any> {
    constructor(props: FriendListProps) {
        super();
        this.props = props;
    }

    friendClicked(friend: any, event: any) {
        ChatAction.friendSelected(friend);
    }

    componentDidUpdate() {
        var needsUpdate = ((this.props.currentFriend || { userID: "" }).userID == "") && (this.props.friendList || []).length > 0;
        if (needsUpdate) {
            var currentFriend = this.props.friendList[0];
            ChatAction.friendSelected(currentFriend);
        }
    }

    render() {
        var friendlistStyle = {
            'overflow': 'auto',
            'paddingTop': 0,
            'maxHeight': 'calc(100vh - 63px)'
        };

        let leftPane = { 'height': 'calc(100vh - 8px)', 'maxHeight': 'calc(100vh - 8px)' };
        return (<div style={leftPane}>
                 {this.renderToolbar() }
                 <ListDivider />
                 <List style={friendlistStyle}>
                    { this.props.friendList.map((friend: any) => this.renderListItem(friend)) }
                 </List>
            </div>);
    }

    state: any = {
        'active': {
            position: 'absolute',
            bottom: 2,
            right: 0,
            border: '1px solid green',
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: 'green'
        },
        'offline': {
            position: 'absolute',
            bottom: 2,
            right: 0,
            border: '1px solid gray',
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: 'gray'
        },
        'idle': {
            position: 'absolute',
            bottom: 2,
            right: 0,
            border: '1px solid yellow',
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: 'yellow'
        },
        'invisible': {
            position: 'absolute',
            bottom: 2,
            right: 0,
            border: '1px solid gray',
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: 'gray'
        },
        'selected': {
            backgroundColor: '#6d84b4'
        }
    };

    renderListItem(friend: any) {
        var currentFriend = (this.props.currentFriend || { userID: '' });
        var isCurrentFriend = friend.userID == currentFriend.userID;
        var style = isCurrentFriend ? this.state.selected : {};
        var presence = friend.presence.status;
        return (<ListItem
            key={friend.userID}
            leftAvatar={<div><Avatar  size={32} src={friend.profilePicture} />
                                           <span style={this.state[presence || 'offline']}></span>
                </div>}
            style={style}
            onClick={this.friendClicked.bind(this, friend) }
            primaryText={friend.fullName}>
            </ListItem>);
    }

    renderToolbar() {
        return (<Toolbar>
                    <ToolbarGroup key={0} float="left">
                        <SearchField />
                        </ToolbarGroup>
                    <ToolbarGroup key={1} float="right">
                        <ToolbarSeparator/>
                        <Popover listStyle={{ background: '#C7C3C3', left: 'calc(50% - 10.2em)' }}
                            iconButtonElement={<IconButton><FontIcon className="fa fa-bell notification" /></IconButton>}
                            openDirection='bottom-right'>
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
            </Toolbar>);
    }
}
