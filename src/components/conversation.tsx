import * as React from 'react';
import {Hbox, Vbox} from './layout';
import ConversationHistory from './conversation-history';

const Avatar = require('material-ui/lib/avatar');
const FontIcon = require('material-ui/lib/font-icon');
const IconButton = require('material-ui/lib/icon-button');
const TextField = require('material-ui/lib/text-field');
const Cards = require('material-ui/lib/card');
const Card = Cards.Card;
const CardHeader = Cards.CardHeader;
const CardActions = Cards.CardActions;
const CardText = Cards.CardText;
const CardMedia = Cards.CardMedia;


export class ConversationProps {
    messages: any;
    currentFriend: any;
	currentUser: any;
}

export default class Conversation extends React.Component<ConversationProps, any> {
    constructor(props: ConversationProps) {
        super();
        this.props = props;
    }

    render() {
        var styles = {
            rightPane: {
                flex: 2, 
                height: 'calc(100vh - 8px)',
                maxHeight: 'calc(100vh - 8px)'
            }
        };

        var currentFriend = this.props.currentFriend || {userID: ""};
        var currentUser = this.props.currentUser;
        var messages = this.props.messages;
               
        return (<Card style={styles.rightPane}>
                    {this.renderHeader(currentFriend)}
                    <ConversationHistory messages={messages} currentUser={currentUser} currentFriend={currentFriend} />
                    <CardActions style={{borderTop:'2px solid #CCC', padding:0}}>
                        <Hbox style={{margin:0, padding:0}}>
                            <TextField hintText="Write a message..." multiLine={true} rows={1} rowsMax={2} style={{flex:2}}></TextField>
                            <IconButton><FontIcon className="fa fa-paper-plane fa-2" /></IconButton>
                        </Hbox>
                    </CardActions>
                  </Card>);
    }
    
    renderHeader(currentFriend: any) {
        return (<CardHeader title={currentFriend.fullName} avatar={<Avatar size={32} src={currentFriend.profilePicture} />} />);
    }
}
