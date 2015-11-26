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
    
    constructor(){
        super();
        this.friendList = [];
        this.messages = {};
        this.currentFriend = {userID: ''};
    }
    
    get actions() {
        return {
            'initApi': 'loadFriendList',
            'setCurrentChatThread': 'setCurrentChatThread',
            'friendSelected': 'friendSelected',
            "markAsRead": "markAsRead"
        };
    }

    loadFriendList(api: any) {
        this.api = api;
        this.chatService = new ChatService(api);
        this.currentUserId = this.chatService.currentUserId;
        
        var p1 = this.chatService.getCurrentUserInfo();
        var p2 = this.chatService.getFriendList();
        
        Promise.all([p1, p2]).then(function(data: Array<any>){
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

    markAsRead(threadID: string) {
        var retryCount = 0;
        this.chatService.markAsRead(threadID).then(()=> {
            this.emit("change");
        }).catch(((err: any) => {
             if(retryCount < 3) {
                setTimeout((function(){
                    this.markAsRead(threadID);
                    retryCount++;
                }).bind(this), 1000);
            }
        }).bind(this));
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
            if(threadID == this.currentUserId) {
                threadID = (event.threadID || "").toString();
            }
            
            if(!this.messages[threadID]){
                this.messages[threadID] = new Array<string>();
            }
            this.messages[threadID].push(event);
            this.emit('change');
            console.log(event);
        }.bind(this));

        this.chatService.listener.on('event', function(event: any, stopListening: Function) {
            console.log(event);
        }.bind(this));
        
        this.chatService.listener.on('typ', function(event: any, stopListening: Function) {
            if(this.currentFriend && this.currentFriend.userID == event.from) {
                this.currentFriend.isTyping = event.isTyping;
                this.emit('change');
            }
            console.log(event);
        }.bind(this));

        this.chatService.listener.on('presence', function(event: any, stopListening: Function) {
            for(let user in this.friendList) {
               if(user.userID == event.userID){
                    user.presence.status = event.statuses.status;
                    break;
               }  
            }
        }.bind(this));
    }
}
