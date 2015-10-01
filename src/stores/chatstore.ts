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
            this.friendList = data;
            this.currentFriend = this.friendList[Object.keys(this.friendList)[0]];
            console.log("Friendlist");
            console.log(this.friendList);
            this.emit('change');
            this.listen();
        }.bind(this)).catch(function(err: any) {
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
        });

        this.chatService.listener.on('message', function(event: any, stopListening: Function) {
            console.log(event);
        });

        this.chatService.listener.on('event', function(event: any, stopListening: Function) {
            console.log(event);
        });

        this.chatService.listener.on('presence', function(event: any, stopListening: Function) {
            console.log(event);
        });
    }
}
