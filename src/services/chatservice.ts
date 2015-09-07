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
        return this.api.getCurrentUserId();
    }

    getFriendList(): Promise<Array<any>> {
        var api = this.api;
        return new Promise(function(resolve: Function, reject: Function) {
            api.getFriendsList(api.getCurrentUserId(), function(err: any, data: Array<any>) {
                if (err) {
                    reject(err);
                } else {
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
