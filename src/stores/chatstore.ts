import {Store} from 'delorean';
import ChatService from '../services/chatservice';
import {EventEmitter} from 'events';

export default class ChatStore extends Store {
    private api: any;
    private chatService: ChatService;
    currentUserId: string;
    currentChatThread: string;
    error: any;
    friendList: any[];
    messages: { [chatThreadId: string]: Array<any> };//Dictionary<string, Array<any>>
    currentFriend: any;
    currentUser: any;
    typingTimers: { [chatThreadId: string]: any };
    typingEnders: { [chatThreadId: string]: Function };
    friendListFilterText: string;

    constructor() {
        super();
        this.friendList = [];
        this.messages = {};
        this.currentFriend = { userID: '' };
        this.typingEnders = {};
        this.typingTimers = {};
    }

    get actions() {
        return {
            'initApi': 'loadFriendList',
            'setCurrentChatThread': 'setCurrentChatThread',
            'friendSelected': 'friendSelected',
            "markAsRead": "markAsRead",
            "sendMessage": "sendMessage",
            "sendTypingIndicator": "sendTypingIndicator",
            "endTypingIndicator": "endTypingIndicator",
            "filterFriendList": "filterFriendList",
            "enqueueLikeSticker": "enqueueLikeSticker",
            "finalizeLikeSticker": "finalizeLikeSticker"
        };
    }

    loadFriendList(api: any) {
        this.api = api;
        this.chatService = new ChatService(api);
        this.currentUserId = this.chatService.currentUserId;

        var p1 = this.chatService.getCurrentUserInfo();
        var p2 = this.chatService.getFriendList();

        Promise.all([p1, p2]).then(function(data: Array<any>) {
            this.currentUser = data[0];
            this.friendList = data[1] as any[];
            this.emit('change');
            this.listen();
        }.bind(this)).catch(function(err: any) {
            console.log(err);
            this.error = err;
            this.emit('change');
        }.bind(this));
    }

    friendSelected(friend: any) {
        this.currentFriend = friend;
        this.emit('change');
    }

    setCurrentChatThread(chatThread: string) {
        this.currentChatThread = chatThread;
        this.emit('change');
    }

    markAsRead(threadID: string, retryCount?: number) {
        retryCount = retryCount || 0;
        this.chatService.markAsRead(threadID).then(() => {
            this.emit("change");
        }).catch(((err: any) => {
            if (retryCount < 3) {
                setTimeout((function() {
                    this.markAsRead(threadID, retryCount++);
                }).bind(this), 1000);
            }
        }).bind(this));
    }

    localGUID = 0;
    sendMessage(payload: any) {
        var {threadID, message} = payload;
        console.log("ChatStore: sendMessage: %o to %s", message, threadID);
        (function(threadID: string, msg: any) {
            msg.messageID = "sending-inprogress-" + (this.localGUID++);
            this.addMessage(threadID, msg);
            console.log("sending message %o to %s", msg, threadID);
            this.chatService.sendMessage(msg, threadID).then((returnMessage: any) => {
                console.log("message sent: %o, %s", returnMessage, threadID);
                msg.messageID = returnMessage.messageID;
            });
            this.emit("change");
        }.bind(this))(threadID, message);
    }
    
    transferMessageProps(dest:any, source:any) {
        dest.senderName = source.senderName;
        dest.senderID = source.senderID;
        dest.participantNames = source.participantNames;
        dest.participantIDs = source.participantIDs;
        dest.threadID = source.threadID;
        dest.threadName = source.threadName;
        dest.location = source.location;
        dest.messageID = source.messageID;
        dest.attachments = source.attachments;
        dest.timestamp = source.timestamp;
        dest.timestampAbsolute = source.timestampAbsolute;
        dest.timestampRelative = source.timestampRelative;
        dest.timestampDatetime = source.timestampDatetime;
    }

    addMessage(threadID: string, message: any) {
        if (!this.messages[threadID]) {
            this.messages[threadID] = new Array<string>();
        }
        let senderID = (message.senderID || "").toString();
        if(senderID === this.currentUser.userID) {
            console.log("Received back own message %o, %s", message, threadID);
            let messages = this.messages[threadID];
            for(let msg of messages) {
                // todo: check attachments too.
                if((/^sending-inprogress-\d+$/).test(msg.messageID) && msg.body == message.body) {
                    // case sentMessage callback comes second to listen event.
                    this.transferMessageProps(msg, message);
                    console.log("Message in progress received %o, %s", message, threadID);
                    return;
                } else if(msg.messageID == message.messageID) {
                    // case sentMessage callback comes before listen event.
                    this.transferMessageProps(msg, message);
                    console.log("Message is already tracked: %o, %s", message, threadID);
                    return;
                }
            }
        } 
        this.messages[threadID].push(message);
    }

    sendTypingIndicator(threadID: string) {
        var timer = this.typingTimers[threadID] || null;
        if(timer === null) {
            this.chatService.sendTypingIndicator(threadID).then((end: Function) => {
                this.typingEnders[threadID] = end;
                this.typingTimers[threadID] = setTimeout(() => {
                    this.typingTimers[threadID] = null;
                    this.endTypingIndicator(threadID);
                }, 30000);
            }).catch(() => {
                this.typingTimers[threadID] = null;
            });
        }
    }
    
    endTypingIndicator(threadID: string) {
        var end = this.typingEnders[threadID] || null;
        if(end !== null) {
            end();
            this.typingEnders[threadID] = null;
        }
    }
    
    filterFriendList(friendListFilterText: string) {
        this.friendListFilterText = friendListFilterText;
        this.emit("change");
    }
    
    finalizeLikeSticker(payload: any) {
        var {threadID, stickerID} = payload;
        var message = this.messages[threadID].find(t => t.messageID == this.likeStickerTrackerId);
        if(message != null) {
            this.chatService.sendMessage(message, threadID).then((returnMessage: any) => {
                console.log("like sticker sent: %o, %s", returnMessage, threadID);
                message.messageID = returnMessage.messageID;
            });
        }
        console.log("message after finalizeLikeSticker %o", this.messages[threadID]);
        this.likeStickerTrackerId = ""; 
        this.emit("change");
    }
    
    likeStickerTrackerId = "";
    enqueueLikeSticker(payload: any) {
        var {threadID, stickerID} = payload;
        console.log("chatstore: enqueueLikeSticker %s,%s", threadID, stickerID);
        if(this.likeStickerTrackerId == "") {
            this.likeStickerTrackerId = "sending-inprogress-" + (this.localGUID++);
        }
        
        if (!this.messages[threadID]) {
            this.messages[threadID] = new Array<string>();
        }
        if(stickerID == 0){
            console.log("chatstore: enqueueLikeSticker, remove sticker %s,%s", threadID, stickerID);
            this.messages[threadID] = this.messages[threadID].filter(t => t.messageID != this.likeStickerTrackerId);
            this.emit("change");
            return;
        }
        var message = this.messages[threadID].find(t => t.messageID == this.likeStickerTrackerId);
        if(message == null){
            message = {messageID: this.likeStickerTrackerId, 
                senderID: this.currentUser.userID, 
                threadID: threadID, 
                sticker: stickerID
            };
            console.log("chatstore: enqueueLikeSticker, add sticker %s,%s", threadID, stickerID);
            this.messages[threadID].push(message);
        } else {
            console.log("chatstore: enqueueLikeSticker, update sticker %s,%s", threadID, stickerID);
            message.sticker = stickerID;
        }
        this.emit("change");
    }
    
    listen() {
        console.log("listening to events...");
        this.chatService.listen();

        this.chatService.listener.on('error', function(error: any, stopListening: Function) {
            console.log(error);
            console.log(error.stack);
            /*
            OperationalError {cause: Error: connect ETIMEDOUT 10.0.0.1:443, isOperational: true, code: "ETIMEDOUT", errno: "ETIMEDOUT", syscall: "connect"…}
address: "10.0.0.1"
cause: Error: connect ETIMEDOUT 10.0.0.1:443
code: "ETIMEDOUT"
errno: "ETIMEDOUT"
isOperational: true
message: "connect ETIMEDOUT 10.0.0.1:443"
name: "Error"
port: 443
stack: "Error: connect ETIMEDOUT 10.0.0.1:443↵    at Object.exports._errnoException (util.js:749:11)↵    at exports._exceptionWithHostPort (util.js:772:20)↵    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1009:14)"
syscall: "connect"
             */
        }.bind(this));

        this.chatService.listener.on('message', function(event: any, stopListening: Function) {
            var threadID = (event.senderID || "").toString();
            if (threadID == this.currentUserId) {
                threadID = (event.threadID || "").toString();
            }

            console.log("listen: message received: %o", event);
            this.addMessage(threadID, event);
            this.emit('change');
        }.bind(this));

        this.chatService.listener.on('event', function(event: any, stopListening: Function) {
            console.log(event);
        }.bind(this));

        this.chatService.listener.on('typ', function(event: any, stopListening: Function) {
            if (this.currentFriend && this.currentFriend.userID == event.from) {
                this.currentFriend.isTyping = event.isTyping;
                this.emit('change');
                console.log("listen: %s %s: %o", this.currentFriend.fullName, this.currentFriend.isTyping? "is typing..." : "stopped typing", event);
            }
        }.bind(this));

        this.chatService.listener.on('presence', function(event: any, stopListening: Function) {
            for (let user in this.friendList) {
                if (user.userID == event.userID) {
                    user.presence.status = event.statuses.status;
                    break;
                }
            }
        }.bind(this));
    }
}
