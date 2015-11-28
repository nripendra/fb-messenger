import {EventEmitter} from 'events';

export interface IMessage {
    body: string;
    sticker: string;
    attachment: any;
}

export default class ChatService {
    api: any;
    listener: EventEmitter;

    constructor(api: any) {
        this.api = api;
        this.listener = new EventEmitter();
        this.api.setOptions({ selfListen: true, listenEvents: true, updatePresence: true });
    }

    get currentUserId(): string {
        return this.api.getCurrentUserID();
    }

    getCurrentUserInfo(): Promise<any> {
        var api = this.api;
        var currentUserId = this.api.getCurrentUserID();
        return new Promise(function(resolve: Function, reject: Function) {
            console.log("Fetching my detail..");
            api.getUserInfo([currentUserId], function(err: any, ret: Array<any>) {
                if (err) {
                    reject(err);
                } else {
                    var info = ret[currentUserId];
                    info.userID = currentUserId;
                    info.fullName = (info.fullName || info.name || info.firstName);
                    info.profilePicture = info.profilePicture || info.thumbSrc;
                    resolve(info);
                    console.groupCollapsed("got my details..");
                    console.log(info);
                    console.groupEnd();
                }
            });
        });
    }
    
    getFriendList(): Promise<Array<any>> {
        var api = this.api;
        var getFriendsList = new Promise(function(resolve: Function, reject: Function) {
            console.log("Fetching Friends..")
            api.getFriendsList(function(err: any, data: Array<any>) {
                if (err) {
                    reject(err);
                } else {
                    console.groupCollapsed("got Friends..");
                    console.log(data);
                    console.groupEnd();
                    resolve(data);
                }

            });
        });
        
        var getOnlineFriends = new Promise(function(resolve: Function, reject: Function) {
            console.log("Fetching online friends..");
            api.getOnlineUsers(function(err: any, data: Array<any>) {
                if (err) {
                    reject(err);
                } else {
                    console.groupCollapsed("got online friends..");
                    console.log(data);
                    console.groupEnd();
                    resolve(data);
                }

            });
        });
        
        return new Promise(function(resolve: Function, reject: Function) {
            Promise.all([getFriendsList, getOnlineFriends]).then((zipped)=>{
                var usermap = zipped[0] as Array<any>;
                var olUsers = zipped[1] as Array<any>;
                usermap.forEach(u => {
                    u.presence = {status: "offline"};
                    for(let status of olUsers){
                        if(u.userID == status.userID) {
                            u.presence = status;
                            break;
                        }
                    }
                });
                console.groupCollapsed("merged friends + online..");
                console.log(usermap.filter(x => x.presence.status != "offline"));
                console.groupEnd();
                resolve(usermap);
            }).catch(err =>{
                console.log(err);
                reject(err);
            });
        });
        

    }

    sendMessage(message: IMessage, threadId: string): Promise<any> {
        return new Promise<any>(function(resolve: Function, reject: Function) {
            this.api.sendMessage(message, threadId, function(err: any, obj: any) {
                if (err) {
                    reject(err);
                } else {
                    resolve(obj);
                }
            });
        }.bind(this));
    }

    markAsRead(threadId: string): Promise<any> {
        return new Promise<any>(function(resolve: Function, reject: Function) {
            this.api.markAsRead(threadId, function(err: any) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        }.bind(this));
    }
    
    sendTypingIndicator(threadId: string): Promise<any> {
        return new Promise<any>(function(resolve: Function, reject: Function) {
            console.log("chatservice sendTypingIndicator: %s", threadId);
            this.api.sendTypingIndicator(threadId, function(err: any, end: Function) {
                if (err) {
                    console.log("chatservice sendTypingIndicator error %o", err);
                    reject(err);
                } else {
                    console.log("chatservice sendTypingIndicator sent");
                    resolve(end);
                }
            });
        }.bind(this));
    }

    listen() {
        var api = this.api;

        api.listen(function(err: any, event: any, stopListening: Function) {
            if (err) {
                this.listener.emit('error', err, stopListening);
            } else {
                this.listener.emit(event.type, event, stopListening);
            }
        }.bind(this));
    }
}
