import * as React from "react";
import AppStores from "../appstores";
import stringScore from "../services/string-score"

export default function(ComposedComponent: any): any {
    return class ConnectedComponent extends React.Component<any, any> {
        friendList: any[];
        constructor(props: any) {
            super();
            this.props = props;
        }
        
        sortAndFilterFriendList() {
            var chatStore = AppStores.chatStore;//need to decouple from dirrect access to AppStores
            var friendListFilterText: string = this.props.friendListFilterText || "";
            var checkScore: boolean = friendListFilterText.trim().length > 0
            this.friendList = (this.props.friendList || []).sort((x: any, y: any) => {
                x.searchScore = 0;
                y.searchScore = 0;
                if (friendListFilterText !== "") {
                    var xScore = stringScore(x.fullName, friendListFilterText);
                    var yScore = stringScore(y.fullName, friendListFilterText);

                    x.searchScore = xScore;
                    y.searchScore = yScore;

                    var diff = yScore - xScore;
                    return diff;
                }
                var xMessage: any = (chatStore.messages[x.userID] || []);
                var yMessage: any = (chatStore.messages[y.userID] || []);
                if (xMessage.length > 0) {
                    xMessage = xMessage[xMessage.length - 1];
                } else {
                    xMessage = { timestamp: 0 };
                }

                if (yMessage.length > 0) {
                    yMessage = yMessage[yMessage.length - 1];
                } else {
                    yMessage = { timestamp: 0 };
                }

                var diff = yMessage.timestamp - xMessage.timestamp;
                if (diff == 0) {
                    var presencePriority = { 'active': 3, 'idle': 2, 'invisible': 1, 'offline': 0 };
                    var presence1 = (presencePriority[x.presence.status]) || 0;
                    var presence2 = (presencePriority[y.presence.status]) || 0;
                    if (presence1 == presence2) {
                        return (x.firstName).localeCompare(y.firstName);
                    } else {
                        return presence2 - presence1;
                    }
                }
                return diff;
            }).filter((x: any) => x.isFriend === true && (checkScore === false || x.searchScore > 0.35));
        }

        render() {
            this.sortAndFilterFriendList();
            const { currentFriend, friendListFilterText } = this.props;
            return (<ComposedComponent currentFriend={currentFriend} 
                                       friendListFilterText={friendListFilterText} 
                                       friendList={this.friendList} />);
        }
    }

}
