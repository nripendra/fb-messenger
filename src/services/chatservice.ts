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

    getFriendList(): Promise<Array<any>> {
        var api = this.api;
        var currentUserId = this.api.getCurrentUserID();
        var getFriendsList = new Promise(function(resolve: Function, reject: Function) {
            api.getFriendsList(currentUserId, function(err: any, data: Array<any>) {
                if (err) {
                    reject(err);
                } else {
                    data.unshift(currentUserId);
                    
                    api.getUserInfo(data, function(err: any, ret: Array<any>) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(ret);
                        }
                    });
                }

            });
        });
        
        var getOnlineFriends = new Promise(function(resolve: Function, reject: Function) {
            api.getOnlineUsers(function(err: any, data: Array<any>) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }

            });
        });
        
        return new Promise(function(resolve: Function, reject: Function) {
            Promise.all([getFriendsList, getOnlineFriends]).then((zipped)=>{
                var usermap = zipped[0];
                var olUsers = zipped[1] as Array<any>;
                olUsers.forEach(x => {
                    if(usermap.hasOwnProperty(x.userID)){
                         usermap[x.userID].presence = x;
                         usermap[x.userID].presence.statuses = usermap[x.userID].presence.statuses || {status: 'active'};
                    }
                });
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
