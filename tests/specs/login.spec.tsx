/// <reference path="../../tools/typings/jasmine/jasmine.d.ts"/>
import App from '../../src/components/app';
import Chat from '../../src/components/chat';
import AutoUpdater from "../../src/components/auto-updater";
import AutoUpdateService from "../../src/services/auto-updateservice";
import Login from '../../src/components/login';
import FriendList from '../../src/components/friendlist';
import MessageItem from '../../src/components/message-item';
import AppStores from '../../src/appstores';
import LoginActions from '../../src/actions/loginactions';
import LoginService from '../../src/services/loginservice';
import ChatStore from '../../src/stores/chatstore';

import * as jsdom from 'jsdom';
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
            AppStores.loginStore.isAuthenticated = true;
            AppStores.loginStore.api = {
                setOptions: () => { return; },
                getCurrentUserID: () => { return "123" },
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
            //jsdom doesn't support html5 checkValidity..
            //tried pollyfilling using H5F, but react doesn't like it.
            HTMLFormElement.prototype.checkValidity = () => true;

            spyOn(LoginActions, 'authenticate');
            var loginForm = ReactDom.render(<Login store={AppStores.loginStore} />, document.getElementById('fb-messenger'));
            //console.log(ReactDom.findDOMNode(loginForm.refs["btnLogin"]));
            ReactTestUtils.Simulate.click(ReactDom.findDOMNode(loginForm.refs["btnLogin"]).firstChild);
            expect(LoginActions.authenticate).toHaveBeenCalled();
        });

        it("should call setErrors when login button is clicked, and form is invalid", () => {
            //jsdom doesn't support html5 checkValidity..
            //tried pollyfilling using H5F, but react doesn't like it.
            HTMLFormElement.prototype.checkValidity = () => false;

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
    
    beforeEach(function() {
    
        (global as any).document = jsdom.jsdom('<!doctype html><html><body><div id="fb-messenger"></div></body></html>');
        (global as any).window = document.defaultView;
        (global as any).Element = (global as any).window.Element;
        (global as any).HTMLFormElement = (global as any).window.HTMLFormElement;
        (global as any).navigator = {
            userAgent: 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36'
        };

        React = require('react');

        ReactTestUtils = require('react-addons-test-utils');
        ReactDom = require('react-dom');
    });

    afterEach(function(done) {
        ReactDom.unmountComponentAtNode(document.getElementById('fb-messenger'))
        React = null;
        ReactTestUtils = null;
        ReactDom = null;
        (global as any).document.body.innerHTML = "";
        (global as any).document = null;
        (global as any).window = null;
        (global as any).Element = null;
        (global as any).navigator = {
            userAgent: 'node.js'
        };
        setTimeout(done)
    });
});
