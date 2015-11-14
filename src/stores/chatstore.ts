import {Store} from 'delorean';
import ChatService from '../services/chatservice';
import {EventEmitter} from 'events';

export default class ChatStore extends Store {
    private api: any;
    private chatService: ChatService;
    currentUserId: string;
    currentChatThread: string;
    error: any;
    friendList: { [id: string] : any; };//Dictionary<string, any>;
    messages: { [chatThreadId: string]: Array<any> };//Dictionary<string, Array<any>>
    currentFriend: any;
    
    constructor(){
        super();
        this.friendList = {};
        this.messages = {};
        this.currentFriend = {id: ''};
    }
    
    get actions() {
        return {
            'initApi': 'loadFriendList',
            'setCurrentChatThread': 'setCurrentChatThread',
            'friendSelected': 'friendSelected'
        };
    }

    loadFriendList(api: any) {
        this.api = api;
        this.chatService = new ChatService(api);
        this.currentUserId = this.chatService.currentUserId;

        this.chatService.getFriendList().then(function(data: Array<any>) {
            this.friendList = data
            this.currentFriend = this.friendList[Object.keys(this.friendList)[0]];
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

    listen() {
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
            console.log(event);
        }.bind(this));

        this.chatService.listener.on('presence', function(event: any, stopListening: Function) {
            var user = this.friendList[event.userID]; 
            if(user){
                user.presence = event;
                this.emit('change');
                console.log(user);
            } else {
                if((event.statuses || {status: 'offline'}).status == "active") {
                    //getuser info and add to the friendlist
                    console.log(event);
                }
            }
            
        }.bind(this));
    }
}
