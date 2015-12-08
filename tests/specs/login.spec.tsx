import App from '../../src/components/app';
import Chat from '../../src/components/chat';
import AutoUpdater from "../../src/components/auto-updater";
import AutoUpdateService from "../../src/services/auto-updateservice";
import Login from '../../src/components/login';
import FriendList from '../../src/components/friendlist';
import MessageItem from '../../src/components/message-item';
import Conversation from "../../src/components/conversation";
import ConversationHistory from "../../src/components/conversation-history";
import AppStores from '../../src/appstores';
import LoginActions from '../../src/actions/loginactions';
import LoginService from '../../src/services/loginservice';
import ChatStore from '../../src/stores/chatstore';
import ChatActions from '../../src/actions/chatactions';
import SendMessageTextField from "../../src/components/send-message-text-field";
import TypingIndicator from '../../src/components/typing-indicator';
import ImageViewer from '../../src/components/image-viewer';
import Beeper from '../../src/components/beeper';

const TextField = require("material-ui/lib/text-field");
let React: any = null;
let ReactTestUtils: any = null;
let ReactDom: any = null;
describe("fb-messenger", () => {
    describe("app", () => {
        beforeEach(function() {
            spyOn(AutoUpdateService.prototype, "checkForUpdate").and.callFake(function() {
                return;// noop
            });
        });
        it("should show login form", () => {
            AppStores.loginStore.isAuthenticated = false;
            var myApp = ReactDom.render(<App />, document.getElementById("fb-messenger"));
            expect(ReactTestUtils.scryRenderedComponentsWithType(myApp, Login).length).toBe(1);
        });

        it("should show chat component when loginStore.isAuthenticated is true", () => {
            (global as any).electronRequire = (module: string)=> {
                return {getCurrentWindow: ()=> {return {isFocused: false};}};
            };
            AppStores.loginStore.isAuthenticated = true;
            AppStores.loginStore.api = {
                setOptions: () => { return; },
                getCurrentUserID: () => { return "123"; },
                getFriendsList: function(currentUserId:any, cb:Function){
                    cb(null, [{"1": {id: "1", name:"Friend1"}}]);
                },
                getUserInfo: function(data:any, cb:Function){
                    cb({
                        "1": {
                            id:"1",
                            name:"friend1",
                            thumbSrc:"http://www.marismith.com/wp-content/uploads/2014/07/facebook-profile-blank-face.jpeg"
                        }
                    });
                }
            };
            var myApp = ReactDom.render(<App />, document.getElementById("fb-messenger"));
            expect(ReactTestUtils.scryRenderedComponentsWithType(myApp, Chat).length).toBe(1);
        });
    });

    describe("login", () => {
        it("should show login from controls", () => {
            var loginForm = ReactDom.render(<Login store={AppStores.loginStore} />, document.getElementById('fb-messenger'));
            expect(ReactTestUtils.scryRenderedDOMComponentsWithTag(loginForm, "input").length).toBe(2);
        });

        it("should show validation errors when there are values in errors property of loginStore", () => {
            AppStores.loginStore.isAuthenticated = false;
            AppStores.loginStore.setErrors({
                username: "Username cannot be empty",
                password: "password cannot be empty",
                credential: ""
            });

            var loginForm = ReactDom.render(<Login store={AppStores.loginStore} />, document.getElementById('fb-messenger'));
            expect(loginForm.refs["username"].state.errorText).toEqual("Username cannot be empty");
            expect(loginForm.refs["password"].state.errorText).toEqual("password cannot be empty");
            expect(ReactDom.findDOMNode(loginForm.refs["credentialError"]).innerHTML.length).toBe(0);
        });

        it("should call authenticate when login button is clicked, and form is valid", () => {

            spyOn(LoginActions, 'authenticate');
            var loginForm = ReactDom.render(<Login store={AppStores.loginStore} />, document.getElementById('fb-messenger'));
            var usernameTextField = loginForm.refs["username"] as any;
            var passwordTextField = loginForm.refs["password"] as any;            
            usernameTextField.setValue("myuser@123.com");
            passwordTextField.setValue("mypassword");           
            ReactTestUtils.Simulate.click(ReactDom.findDOMNode(loginForm.refs["btnLogin"]).firstChild);
            expect(LoginActions.authenticate).toHaveBeenCalled();
        });

        it("should call setErrors when login button is clicked, and form is invalid", () => {

            spyOn(LoginActions, 'setErrors');

            var loginForm = ReactDom.render(<Login store={AppStores.loginStore} />, document.getElementById('fb-messenger'));

            ReactTestUtils.Simulate.click(ReactDom.findDOMNode(loginForm.refs["btnLogin"]).firstChild);

            expect(LoginActions.setErrors).toHaveBeenCalled();
        });

        it("should call LoginService.authenticate when login button is clicked, and form is valid", () => {
            HTMLFormElement.prototype.checkValidity = () => true;

            //We don't actually want to hit facebook in our unit test
            spyOn(LoginService.prototype, 'authenticate').and.returnValue(Promise.resolve({}));

            var loginForm = ReactDom.render(<Login store={AppStores.loginStore} />, document.getElementById('fb-messenger'));

            ReactTestUtils.Simulate.click(ReactDom.findDOMNode(loginForm.refs["btnLogin"]).firstChild);

            expect(LoginService.prototype.authenticate).toHaveBeenCalled();
        });

        it("should warn user when username/password is wrong", (done: Function) => {
            HTMLFormElement.prototype.checkValidity = () => true;

            var rejected = Promise.reject({});
            spyOn(LoginService.prototype, 'authenticate').and.returnValue(rejected);

            var loginForm = ReactDom.render(<Login store={AppStores.loginStore} />, document.getElementById('fb-messenger'));

            ReactTestUtils.Simulate.click(ReactDom.findDOMNode(loginForm.refs["btnLogin"]).firstChild);

            expect(LoginService.prototype.authenticate).toHaveBeenCalled();

            setTimeout(function() {
                rejected.catch(function() {
                    expect(AppStores.loginStore.errors.credential).toEqual("Invalid username/password");
                    done();
                })
            }, 10);
        });
    });
    
    describe("chat", ()=>
    {
        it("should show the message list of current friend",(done: Function) => {
            AppStores.loginStore.api = {
                setOptions: function(){},
                getCurrentUserID: function(){return "0"},
                getFriendsList: function(currentUserId:any, cb:Function){
                    cb(null, [{userID: '1', name:'Friend1'}]);
                },
                getUserInfo: function(data:any, cb:Function){
                    cb([{userID:'1', name:'friend1', thumbSrc:'http://www.marismith.com/wp-content/uploads/2014/07/facebook-profile-blank-face.jpeg'}]);
                },
            };
            
            AppStores.chatStore.currentUser = {userID: '10'};
            AppStores.chatStore.currentFriend = {userID: '1'};
            AppStores.chatStore.messages['1'] = [{'messageID':'1','body': 'hello', attachments: []}];
            var chatUI = ReactDom.render(<Chat store={AppStores.chatStore} api={AppStores.loginStore.api} />, document.getElementById('fb-messenger'));
            expect(ReactTestUtils.scryRenderedComponentsWithType(chatUI, FriendList).length).toBe(1);
            setTimeout(function() {
                var callouts = ReactTestUtils.scryRenderedDOMComponentsWithClass(chatUI, "callout");
                expect(callouts.length).toBe(1);
                expect(ReactDom.findDOMNode(callouts[0]).innerHTML).toMatch('hello');
                done();
            }, 10);
        });
    });

    describe("conversation", ()=> {
        it("should send markAsRead if new message arrives when the currentWindow is active and textbox is focused", (done: Function)=> {
            (global as any).electronRequire = (module: string)=> {
                return {
                    getCurrentWindow: ()=> {
                        return {isFocused: ()=> true};
                    }
                };
            };

            var api = {
                getCurrentUserID: ()=> { return 10;},
                markAsRead: ()=> {return;},
                getFriendsList: ()=> {return;},
                setOptions: ()=> {return;},
                getOnlineUsers: ()=> {return;}
            };
            AppStores.chatStore.loadFriendList(api);

            spyOn(api, "markAsRead").and.callFake(function() {
                return;// noop
            });

            var conversation = ReactDom.render(<Conversation
                                messages={[{body:"hello", senderID: 1}]}
                                currentFriend={{id: 1}}
                                currentUser={{id: 10}}
                                playNewMessageBeep={false} />,
                            document.getElementById("fb-messenger"));
            conversation.isFocused = true;
            conversation.handleTextFieldFocus();

            expect(api.markAsRead).toHaveBeenCalled();
            setTimeout(done, 5);
        });

        it("should not markAsRead if there is no new message when the currentWindow is active and textbox is focused", (done: Function)=> {
            (global as any).electronRequire = (module: string)=> {
                return {
                    getCurrentWindow: ()=> {
                        return {isFocused: ()=> true};
                    }
                };
            };

            var api = {
                getCurrentUserID: ()=> { return 10;},
                markAsRead: ()=> {return;},
                getFriendsList: ()=> {return;},
                setOptions: ()=> {return;},
                getOnlineUsers: ()=> {return;}
            };
            AppStores.chatStore.loadFriendList(api);

            spyOn(api, "markAsRead").and.callFake(function() {
                return;// noop
            });

            var conversation = ReactDom.render(<Conversation
                                messages={[{body:"hello", senderID: 1, isSeen: true}]}
                                currentFriend={{id: 1}}
                                currentUser={{id: 10}}
                                playNewMessageBeep={false} />,
                            document.getElementById("fb-messenger"));
            conversation.isFocused = true;
            conversation.handleTextFieldFocus();

            expect(api.markAsRead).not.toHaveBeenCalled();
            setTimeout(done, 5);
        });
    });

    describe("message-item", ()=>
    {
        it("should show the message body if there is no attachments",() => {
            var message = {'senderID': '1' ,'messageID':'1','body': 'hello'};
            var messageItem = ReactDom.render(<MessageItem message={message} currentFriend={{userID: '1'}} currentUser={{userID: '10'}} />, document.getElementById('fb-messenger'));
            var callouts = ReactTestUtils.scryRenderedDOMComponentsWithClass(messageItem, "callout");
            expect(ReactDom.findDOMNode(callouts[0]).innerHTML).toMatch('hello');
        });
        
        it("should show the message body if attachments is empty",() => {
            var attachments = new Array<any>();
            var message = {'senderID': '1' ,'messageID':'1','body': 'hello', attachments: attachments};
            var messageItem = ReactDom.render(<MessageItem message={message} currentFriend={{userID: '1'}} currentUser={{userID: '10'}} />, document.getElementById('fb-messenger'));
            var callouts = ReactTestUtils.scryRenderedDOMComponentsWithClass(messageItem, "callout");
            expect(ReactDom.findDOMNode(callouts[0]).innerHTML).toMatch('hello');
        });
        
        it("should show the message sticker if there is one",() => {
            var attachments = new Array<any>({type:"sticker",url: "http://sticker.com/sticker.jpg"});
            var message = {'senderID': '1' ,'messageID':'1','body': '', attachments: attachments};
            var messageItem = ReactDom.render(<MessageItem message={message} currentFriend={{userID: '1'}} currentUser={{userID: '10'}} />, document.getElementById('fb-messenger'));
            var sticker = ReactTestUtils.scryRenderedDOMComponentsWithTag(messageItem, "img");
            expect(sticker.length).toBe(1);
        });
            
        it("should show the emoji icon for emoticons",() => {
            var message = {'senderID': '1' ,'messageID':'1','body': 'Hello world <3'};
            var messageItem = ReactDom.render(<MessageItem message={message} currentFriend={{userID: '1'}} currentUser={{userID: '10'}} />, document.getElementById('fb-messenger'));
            var emoji = ReactTestUtils.scryRenderedDOMComponentsWithClass(messageItem, "em");
            expect(emoji.length).toBe(1);
            expect(ReactDom.findDOMNode(emoji[0]).className).toBe('em emj186');
        });
        
        it("should show the emoji icon for unicode emoji",() => {
            var message = {'senderID': '1' ,'messageID':'1','body': 'Hello world ❤'};
            var messageItem = ReactDom.render(<MessageItem message={message} currentFriend={{userID: '1'}} currentUser={{userID: '10'}} />, document.getElementById('fb-messenger'));
            var emoji = ReactTestUtils.scryRenderedDOMComponentsWithClass(messageItem, "em");
            expect(emoji.length).toBe(1);
            expect(ReactDom.findDOMNode(emoji[0]).className).toBe('em emj186');
        });
    });
    
    describe("typing-indicator", ()=>
    {
        it("should show typing indicator when user's isTyping property is set to true",() => {
            var typingIndicator = ReactDom.render(<TypingIndicator currentFriend={{userID: '1', isTyping: true, profilePicture: 'http://propic1.com/'}} />, document.getElementById('fb-messenger'));
            var indicator = ReactTestUtils.scryRenderedDOMComponentsWithClass(typingIndicator, "typing-indicator");
            expect(indicator.length).toBe(1);
        });
        
        it("shouldn't show typing indicator when user's isTyping property is set to false",() => {
            var typingIndicator = ReactDom.render(<TypingIndicator currentFriend={{userID: '1', isTyping: false, profilePicture: 'http://propic1.com/'}} />, document.getElementById('fb-messenger'));
            var indicator = ReactTestUtils.scryRenderedDOMComponentsWithClass(typingIndicator, "typing-indicator");
            expect(indicator.length).toBe(0);
        });
        
        it("should show user's thumbnail profile picture if isTyping property is set to true",() => {
            var typingIndicator = ReactDom.render(<TypingIndicator currentFriend={{userID: '1', isTyping: true, profilePicture: 'http://propic1.com/'}} />, document.getElementById('fb-messenger'));
            var thumbnail = ReactTestUtils.scryRenderedDOMComponentsWithTag(typingIndicator, "img");
            expect(thumbnail.length).toBe(1);
        });
        
        it("shouldn't show user's thumbnail profile picture if isTyping property is set to flase",() => {
            var typingIndicator = ReactDom.render(<TypingIndicator currentFriend={{userID: '1', isTyping: false, profilePicture: 'http://propic1.com/'}} />, document.getElementById('fb-messenger'));
            var thumbnail = ReactTestUtils.scryRenderedDOMComponentsWithTag(typingIndicator, "img");
            expect(thumbnail.length).toBe(0);
        });
    });

    describe("feat: auto-update", () => {
        describe("auto-updater", ()=> {
            it("should call checkForUpdate",() => {
                spyOn(AutoUpdateService.prototype, "checkForUpdate").and.callFake(function() {
                    return;// noop
                });
    
                ReactDom.render(<AutoUpdater />, document.getElementById("fb-messenger"));
                expect(AutoUpdateService.prototype.checkForUpdate).toHaveBeenCalled();
            });
        });
        
        describe("auto-updater-service", ()=> {
            it("should send request to release api",() => {
                AppStores.autoUpdaterStore.autoUpdateService.electronRequire = (module: string)=> {
                    return {require: (module: string)=> {
                        return {
                            getVersion: ()=> "0.1.0"
                        };
                    }};
                };
    
                var _method = "";
                var _url = "";
                var _async = false;
                spyOn(XMLHttpRequest.prototype, "open").and.callFake(function(method:string, url:string, async:boolean) {
                    _method = method;
                    _url = url;
                    _async = async;
                    return;// noop
                });
                spyOn(XMLHttpRequest.prototype, "send").and.callFake(function() {
                    return;// noop
                });
    
                ReactDom.render(<AutoUpdater />, document.getElementById("fb-messenger"));
                expect(XMLHttpRequest.prototype.open).toHaveBeenCalled();
                expect(XMLHttpRequest.prototype.send).toHaveBeenCalled();
                expect(_method).toBe("GET");
                expect(_url).toBe("https://api.github.com/repos/nripendra/fb-messenger/releases");
                expect(_async).toBe(true);
            });
    
            it("should download if released version > current version, and asset's state is 'uploaded'",() => {
                AppStores.autoUpdaterStore.autoUpdateService.electronRequire = (module: string)=> {
                    return {require: (module: string)=> {
                        return {
                            getVersion: ()=> "0.1.0"
                        };
                    }};
                };
    
                var _method = "";
                var _url = "";
                var _async = false;
                spyOn(XMLHttpRequest.prototype, "open").and.callFake(function(method:string, url:string, async:boolean) {
                    _method = method;
                    _url = url;
                    _async = async;
                    return;// noop
                });
                spyOn(XMLHttpRequest.prototype, "send").and.callFake(function() {
                    if(this.onreadystatechange != null) {
                        this.readyState = 4;
                        this.status = 200;
                        this.responseText = JSON.stringify([
                            {tag_name: "0.1.1", prelease: false, assets:[
                                {
                                    name: "fb-messenger-setup.exe",
                                    state: "uploaded"
                                }
                            ]}
                        ]);
                        this.onreadystatechange();
                    }
                    return;// noop
                });
                spyOn(AutoUpdateService.prototype, "download").and.callFake(function() {
                    return;// noop
                });
                spyOn(AutoUpdateService.prototype, "recheckAfter").and.callFake(function() {
                    return;// noop
                });
    
                ReactDom.render(<AutoUpdater />, document.getElementById("fb-messenger"));
                expect(AutoUpdateService.prototype.download).toHaveBeenCalled();
            });
    
            beforeEach(function() {
                var _global = (global as any);
                _global.XMLHttpRequest = class {
                    onerror:Function;
                    onreadystatechange:Function;
                    readyState:number;
                    status:number;
                    responseText:string;
                    open() {
                        return;
                    }
                    send() {
                        return;
                    }
                };
            });
        });
    });

    describe("feat: Send text message", ()=>{
        it("should send the typed message when send button is clicked", () => {
            var api = {
                getCurrentUserID: ()=> { return 10;},
                getUserInfo: ()=> { return 10;},
                markAsRead: ()=> {return;},
                getFriendsList: ()=> {return;},
                setOptions: ()=> {return;},
                getOnlineUsers: ()=> {return;},
                sendMessage: ()=>{return}
            };
            AppStores.chatStore.loadFriendList(api);

           spyOn(api, "sendMessage").and.callFake(function() {
                return;// noop
           });
           var sendMessageTextField = ReactDom.render(<SendMessageTextField 
                                                            currentFriend={{userID: '1', profilePicture: 'http://propic1.com/'}} 
                                                            currentUser={{userID:'10'}}
                                                            onTextFieldFocus={()=>{}}
                                                            onTextFieldBlur={()=>{}} />, 
                                                            document.getElementById('fb-messenger'));
           sendMessageTextField.handleSendMessage();
           
           expect(api.sendMessage).toHaveBeenCalled();
        });
        
        it("should send the typing indicator when text is changed", () => {
            var api = {
                getCurrentUserID: ()=> { return 10;},
                getUserInfo: ()=> { return 10;},
                markAsRead: ()=> {return;},
                getFriendsList: ()=> {return;},
                setOptions: ()=> {return;},
                getOnlineUsers: ()=> {return;},
                sendMessage: ()=>{return;},
                sendTypingIndicator: ()=>{return;}
            };
            AppStores.chatStore.loadFriendList(api);

           spyOn(api, "sendTypingIndicator").and.callFake(function() {
                return;// noop
           });
           var sendMessageTextField = ReactDom.render(<SendMessageTextField 
                                                            currentFriend={{userID: '1', profilePicture: 'http://propic1.com/'}} 
                                                            currentUser={{userID:'10'}}
                                                            onTextFieldFocus={()=>{}}
                                                            onTextFieldBlur={()=>{}} />, 
                                                            document.getElementById('fb-messenger'));
           (sendMessageTextField.refs["messageField"] as any).setValue("typing..");
           sendMessageTextField.handleTextChange();
           
           expect(api.sendTypingIndicator).toHaveBeenCalled();
        });
        
        it("should end the typing indicator when text is empty", () => {
            var api = {
                getCurrentUserID: ()=> { return 10;},
                getUserInfo: ()=> { return 10;},
                markAsRead: ()=> {return;},
                getFriendsList: ()=> {return;},
                setOptions: ()=> {return;},
                getOnlineUsers: ()=> {return;},
                sendMessage: ()=>{return;},
                sendTypingIndicator: ()=>{return;}
            };
           AppStores.chatStore.loadFriendList(api);

           spyOn(ChatActions, "endTypingIndicator").and.callFake(function() {
                return;// noop
           });
           var sendMessageTextField = ReactDom.render(<SendMessageTextField 
                                                            currentFriend={{userID: '1', profilePicture: 'http://propic1.com/'}} 
                                                            currentUser={{userID:'10'}}
                                                            onTextFieldFocus={()=>{}}
                                                            onTextFieldBlur={()=>{}} />, 
                                                            document.getElementById('fb-messenger'));
           (sendMessageTextField.refs["messageField"] as any).setValue("");
           sendMessageTextField.handleTextChange();
           
           expect(ChatActions.endTypingIndicator).toHaveBeenCalled();
        });
    });
    
    describe("feat: send giant like", ()=> {
        describe("like button", ()=>{
            it("should dispatch enqueueLikeSticker message when pressing mouse button down upon the like icon", () => {
                var api = {
                    getCurrentUserID: ()=> { return 10;},
                    getUserInfo: ()=> { return 10;},
                    markAsRead: ()=> {return;},
                    getFriendsList: ()=> {return;},
                    setOptions: ()=> {return;},
                    getOnlineUsers: ()=> {return;},
                    sendMessage: ()=>{return;},
                    sendTypingIndicator: ()=>{return;}
                };
                AppStores.chatStore.loadFriendList(api);
                
                spyOn(ChatActions, "enqueueLikeSticker").and.callFake(function() {
                    return;// noop
                });
                var sendMessageTextField = ReactDom.render(<SendMessageTextField 
                                                                currentFriend={{userID: '1', profilePicture: 'http://propic1.com/'}} 
                                                                currentUser={{userID:'10'}}
                                                                onTextFieldFocus={()=>{}}
                                                                onTextFieldBlur={()=>{}} />, 
                                                                document.getElementById('fb-messenger'));
                sendMessageTextField.handleLikeButtonMouseDown();
                
                expect(ChatActions.enqueueLikeSticker).toHaveBeenCalled();
            });
            
            it("should dispatch multiple enqueueLikeSticker messages when pressing mouse button down upon the like icon continiously", (done: Function) => {
                var api = {
                    getCurrentUserID: ()=> { return 10;},
                    getUserInfo: ()=> { return 10;},
                    markAsRead: ()=> {return;},
                    getFriendsList: ()=> {return;},
                    setOptions: ()=> {return;},
                    getOnlineUsers: ()=> {return;},
                    sendMessage: ()=>{return;},
                    sendTypingIndicator: ()=>{return;}
                };
                AppStores.chatStore.loadFriendList(api);
                
                spyOn(ChatActions, "enqueueLikeSticker").and.callFake(function() {
                    return;// noop
                });
                var sendMessageTextField = ReactDom.render(<SendMessageTextField 
                                                                currentFriend={{userID: '1', profilePicture: 'http://propic1.com/'}} 
                                                                currentUser={{userID:'10'}}
                                                                onTextFieldFocus={()=>{}}
                                                                onTextFieldBlur={()=>{}} />, 
                                                                document.getElementById('fb-messenger'));
                sendMessageTextField.handleLikeButtonMouseDown();
                
                setTimeout(() =>{
                    expect((ChatActions.enqueueLikeSticker as any).calls.count()).toBeGreaterThan(2);
                    done();
                }, 1600);
            });
            
            it("should dispatch finalizeLikeSticker message when mouse button is released upon the like icon", () => {
                var api = {
                    getCurrentUserID: ()=> { return 10;},
                    getUserInfo: ()=> { return 10;},
                    markAsRead: ()=> {return;},
                    getFriendsList: ()=> {return;},
                    setOptions: ()=> {return;},
                    getOnlineUsers: ()=> {return;},
                    sendMessage: ()=>{return;},
                    sendTypingIndicator: ()=>{return;}
                };
                AppStores.chatStore.loadFriendList(api);
                
                spyOn(ChatActions, "finalizeLikeSticker").and.callFake(function() {
                    return;// noop
                });
                var sendMessageTextField = ReactDom.render(<SendMessageTextField 
                                                                currentFriend={{userID: '1', profilePicture: 'http://propic1.com/'}} 
                                                                currentUser={{userID:'10'}}
                                                                onTextFieldFocus={()=>{}}
                                                                onTextFieldBlur={()=>{}} />, 
                                                                document.getElementById('fb-messenger'));
                sendMessageTextField.handleLikeButtonMouseUp();
                
                expect(ChatActions.finalizeLikeSticker).toHaveBeenCalled();
            });
        });
        
        describe("enqueueLikeSticker", ()=> {
            it("should track the sticker message", () => {
                //Arrange
                AppStores.chatStore.localGUID = 0;
                AppStores.chatStore.likeStickerTrackerId = "";
                AppStores.chatStore.messages["1"] = Array<any>();
                //Act
                AppStores.chatStore.enqueueLikeSticker({threadID: "1", stickerID: 369239263222822});
                
                //Assert
                expect(AppStores.chatStore.likeStickerTrackerId).toBe("sending-inprogress-0");
                expect(AppStores.chatStore.localGUID).toBe(1);
                expect(AppStores.chatStore.messages["1"].length).toBe(1);
                expect(AppStores.chatStore.messages["1"][0].threadID).toBe("1");
                expect(AppStores.chatStore.messages["1"][0].sticker).toBe(369239263222822);
            });
            
            it("should update the stickerID", () => {
                //Arrange
                AppStores.chatStore.localGUID = 0;
                AppStores.chatStore.likeStickerTrackerId = "";
                AppStores.chatStore.messages["1"] = Array<any>();
                AppStores.chatStore.enqueueLikeSticker({threadID: "1", stickerID: 369239263222822});

                //Act
                AppStores.chatStore.enqueueLikeSticker({threadID: "1", stickerID: 369239343222814});
                
                //Assert
                expect(AppStores.chatStore.likeStickerTrackerId).toBe("sending-inprogress-0");
                expect(AppStores.chatStore.localGUID).toBe(1);
                expect(AppStores.chatStore.messages["1"].length).toBe(1);
                expect(AppStores.chatStore.messages["1"][0].threadID).toBe("1");
                expect(AppStores.chatStore.messages["1"][0].sticker).toBe(369239343222814);
            });
            
            it("should remove the sticker message if stickerID is 0", () => {
                //Arrange
                AppStores.chatStore.localGUID = 0;
                AppStores.chatStore.likeStickerTrackerId = "";
                AppStores.chatStore.messages["1"] = Array<any>();
                AppStores.chatStore.enqueueLikeSticker({threadID: "1", stickerID: 369239263222822});

                //Act
                AppStores.chatStore.enqueueLikeSticker({threadID: "1", stickerID: 0});
                
                //Assert
                expect(AppStores.chatStore.likeStickerTrackerId).toBe("");
                expect(AppStores.chatStore.localGUID).toBe(1);
                expect(AppStores.chatStore.messages["1"].length).toBe(0);
            });
        });
    });
    
    describe("feat: add support for receving image", () => {
        describe("message-item component", () => {
            it("should be able to show preview image if attachment type is photo", function(){
                var attachments = new Array<any>({type:"photo",previewUrl: "http://sticker.com/sticker.jpg", previewWidth: 200, previewHeight:200});
                var message = {'senderID': '1' ,'messageID':'1','body': '', attachments: attachments};
                var messageItem = ReactDom.render(<MessageItem message={message} currentFriend={{userID: '1'}} currentUser={{userID: '10'}} />, document.getElementById('fb-messenger'));
                var photo = ReactTestUtils.scryRenderedDOMComponentsWithTag(messageItem, "img");
                expect(photo.length).toBe(1); 
            });
        });
        
        describe("Chat component", () => {
            it("should be able to show large photo when image is clicked", function(){
                var api = {
                    getCurrentUserID: ()=> { return 10;},
                    getUserInfo: ()=> { return 10;},
                    markAsRead: ()=> {return;},
                    getFriendsList: ()=> {return;},
                    setOptions: ()=> {return;},
                    getOnlineUsers: ()=> {return;},
                    sendMessage: ()=>{return;},
                    sendTypingIndicator: ()=>{return;}
                };
                (global as any).electronRequire = ()=>{return {
                    getCurrentWindow: function(){
                        return {};
                    }
                }};
                var attachments = new Array<any>({type:"photo",previewUrl: "http://sticker.com/sticker.jpg", previewWidth: 200, previewHeight:200, url: "http://sticker.com/sticker.jpg", width: 200, height:200});
                var message = {'senderID': '1' ,'messageID':'1','body': '', attachments: attachments};
                AppStores.chatStore.messages = {'1': [message]};
                AppStores.chatStore.currentUser = {userID: '10'};
                AppStores.chatStore.currentFriend = {userID: '1'};
                var chat = ReactDom.render(<Chat api={api} store={AppStores.chatStore} />, document.getElementById('fb-messenger'));
                var photo = ReactTestUtils.scryRenderedDOMComponentsWithTag(chat, "img");
                expect(photo.length).toBe(1); 
                ReactTestUtils.Simulate.click(ReactDom.findDOMNode(photo[0]));
                photo = ReactTestUtils.scryRenderedDOMComponentsWithTag(chat, "img");
                expect(photo.length).toBe(2); 
            });
            
            it("should be able to hide large photo when anywhere in image viewer is clicked", function(cb){
                document.getElementById('fb-messenger').innerHTML = '';
                var api = {
                    getCurrentUserID: ()=> { return 10;},
                    getUserInfo: ()=> { return 10;},
                    markAsRead: ()=> {return;},
                    getFriendsList: ()=> {return;},
                    setOptions: ()=> {return;},
                    getOnlineUsers: ()=> {return;},
                    sendMessage: ()=>{return;},
                    sendTypingIndicator: ()=>{return;}
                };
                (global as any).electronRequire = ()=>{return {
                    getCurrentWindow: function(){
                        return {};
                    }
                }};
                var attachments = new Array<any>({type:"photo",previewUrl: "http://sticker.com/sticker.jpg", previewWidth: 200, previewHeight:200, url: "http://sticker.com/sticker-full.jpg", width: 200, height:200});
                var message = {'senderID': '1' ,'messageID':'1','body': '', attachments: attachments};
                AppStores.chatStore.imageToView = {};
                AppStores.chatStore.messages = {'1': [message]};
                AppStores.chatStore.currentUser = {userID: '10'};
                AppStores.chatStore.currentFriend = {userID: '1'};
                var chat = ReactDom.render(<Chat api={api} store={AppStores.chatStore} />, document.getElementById('fb-messenger'));
                var photo = ReactTestUtils.scryRenderedDOMComponentsWithTag(chat, "img");
                
                
                expect(photo.length).toBe(1);
                ReactTestUtils.Simulate.click(ReactDom.findDOMNode(photo[0]));
                
                photo = ReactTestUtils.scryRenderedDOMComponentsWithTag(chat, "img");
                expect(photo.length).toBe(2); 
                
                var imageViewers = ReactTestUtils.scryRenderedComponentsWithType(chat, ImageViewer);
                ReactTestUtils.Simulate.click(ReactDom.findDOMNode(imageViewers[0]).firstChild);
                
                photo = ReactTestUtils.scryRenderedDOMComponentsWithTag(chat, "img");
                expect(photo.length).toBe(1); 
                
                cb();
            });
        });
    });    
            
    describe("feat: support sound notification when there is new message", () => {
        describe("Beeper", () => {
            it("should beep when playNewMessageBeep is set to true", () => {
                spyOn(Beeper.prototype, "playNewMessageNote").and.callFake(function() {
                    return;// noop
                });
                var beeper = ReactDom.render(<Beeper playNewMessageBeep={true} />, 
                                                document.getElementById('fb-messenger'));
                
                expect(beeper.playNewMessageNote).toHaveBeenCalled();
            });
            
            it("should reset playNewMessageBeep once beeped", () => {
                spyOn(ChatActions, "resetPlayNewMessageBeep").and.callFake(function() {
                    return;// noop
                });
                var beeper = ReactDom.render(<Beeper playNewMessageBeep={true} />, 
                                                document.getElementById('fb-messenger'));
                
                expect(ChatActions.resetPlayNewMessageBeep).toHaveBeenCalled();
            });
        });
        
        describe("Chat", () => {
            it("should pass on chatStore's playNewMessageBeep to beeper", () => {
                var api = {
                    getCurrentUserID: ()=> { return 10;},
                    getUserInfo: ()=> { return 10;},
                    markAsRead: ()=> {return;},
                    getFriendsList: ()=> {return;},
                    setOptions: ()=> {return;},
                    getOnlineUsers: ()=> {return;},
                    sendMessage: ()=>{return;},
                    sendTypingIndicator: ()=>{return;}
                };
                spyOn(Beeper.prototype, "playNewMessageNote").and.callFake(function() {
                    return;// noop
                });
                AppStores.chatStore.setPlayNewMessageBeep(true);
                var chat = ReactDom.render(<Chat api={api} store={AppStores.chatStore} />, 
                                                document.getElementById('fb-messenger'));
                
                expect(Beeper.prototype.playNewMessageNote).toHaveBeenCalled();
            });
        });
        
        describe("ChatStore", () => {
            it("should set playNewMessageBeep when new message is received", () => {
                var _cb: Function;
                var api = {
                    getCurrentUserID: ()=> { return 10;},
                    getUserInfo: ()=> { return 10;},
                    markAsRead: ()=> {return;},
                    getFriendsList: ()=> {return;},
                    setOptions: ()=> {return;},
                    getOnlineUsers: ()=> {return;},
                    sendMessage: ()=>{return;},
                    sendTypingIndicator: ()=>{return;},
                    listen: (cb: Function) => {
                        _cb = cb;
                    }
                };
                spyOn(Beeper.prototype, "playNewMessageNote").and.callFake(function() {
                    return;// noop
                });

                AppStores.chatStore.friendList = [];
                AppStores.chatStore.messages = {};
                AppStores.chatStore.currentFriend = { userID: 1 };
                AppStores.chatStore.typingEnders = {};
                AppStores.chatStore.typingTimers = {};
                AppStores.chatStore.friendListFilterText = null;
                AppStores.chatStore.imageToView = null;
                AppStores.chatStore.messages = {};
                AppStores.chatStore.currentUser = {userID: 10};
                AppStores.chatStore.currentUserId = '10';
                var chat = ReactDom.render(<Chat api={api} store={AppStores.chatStore} />, 
                                                document.getElementById('fb-messenger'));
                

                AppStores.chatStore.listen();
                
                let err: any = null;
                let event: any = {type: "message", senderID: 1, threadID: AppStores.chatStore.currentUser.userID, body: ""};
                let stopListening = () => {return;};
                _cb(err, event, stopListening);
                expect(Beeper.prototype.playNewMessageNote).toHaveBeenCalled();
            });
            
            it("shouldn't set playNewMessageBeep when new message is received from self", () => {
                var _cb: Function;
                var api = {
                    getCurrentUserID: ()=> { return 10;},
                    getUserInfo: ()=> { return 10;},
                    markAsRead: ()=> {return;},
                    getFriendsList: ()=> {return;},
                    setOptions: ()=> {return;},
                    getOnlineUsers: ()=> {return;},
                    sendMessage: ()=>{return;},
                    sendTypingIndicator: ()=>{return;},
                    listen: (cb: Function) => {
                        _cb = cb;
                    }
                };
                spyOn(Beeper.prototype, "playNewMessageNote").and.callFake(function() {
                    return;// noop
                });

                AppStores.chatStore.friendList = [];
                AppStores.chatStore.messages = {};
                AppStores.chatStore.currentFriend = { userID: 1 };
                AppStores.chatStore.typingEnders = {};
                AppStores.chatStore.typingTimers = {};
                AppStores.chatStore.friendListFilterText = null;
                AppStores.chatStore.imageToView = null;
                AppStores.chatStore.messages = {};
                AppStores.chatStore.currentUser = {userID: 10};
                AppStores.chatStore.currentUserId = '10';
                var chat = ReactDom.render(<Chat api={api} store={AppStores.chatStore} />, 
                                                document.getElementById('fb-messenger'));
                
                AppStores.chatStore.listen();
                let err: any = null;
                let event: any = {type: "message", senderID: AppStores.chatStore.currentUser.userID, threadID: 1, body: ""};
                let stopListening = () => {return;};
                _cb(err, event, stopListening);
                expect(Beeper.prototype.playNewMessageNote).not.toHaveBeenCalled();
            });
        });
    });
    
    beforeEach(function() {
        React = require('react');

        ReactTestUtils = require('react-addons-test-utils');
        ReactDom = require('react-dom');
    });

    afterEach(function(done) {
        console.log("after......")
        ReactDom.unmountComponentAtNode(document.getElementById('fb-messenger'))
        React = null;
        ReactTestUtils = null;
        ReactDom = null;
        setTimeout(done)
    });
});
