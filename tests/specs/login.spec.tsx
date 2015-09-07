/// <reference path="../../tools/typings/jasmine/jasmine.d.ts"/>
import App from '../../src/components/app';
import Chat from '../../src/components/chat';

import Login from '../../src/components/login';
import AppStores from '../../src/appstores';
import LoginActions from '../../src/actions/loginactions';
import LoginService from '../../src/services/loginservice';

import * as jsdom from 'jsdom';
let React: any = null;
let ReactTestUtils: any = null;
console.log("describing Login");
describe("fb-messenger", () => {
    describe("app", () => {
        it("should show login form", () => {
            AppStores.loginStore.isAuthenticated = false;
            var myApp = React.render(<App />, document.body);
            expect(ReactTestUtils.scryRenderedComponentsWithType(myApp, Login).length).toBe(1);
        });

        it("should show chat component when loginStore.isAuthenticated is true", () => {
            AppStores.loginStore.isAuthenticated = true;
            AppStores.loginStore.api =
            {
                setOptions: () => { },
                getCurrentUserId: () => { return "123" },
            };
            var myApp = React.render(<App />, document.body);
            expect(ReactTestUtils.scryRenderedComponentsWithType(myApp, Chat).length).toBe(1);
        });
    });

    describe("login", () => {
        it("should show login from controls", () => {
            var loginForm = React.render(<Login store={AppStores.loginStore} />, document.body);
            expect(ReactTestUtils.scryRenderedDOMComponentsWithTag(loginForm, "input").length).toBe(3);
        });

        it("should show validation errors when there are values in errors property of loginStore", () => {
            AppStores.loginStore.isAuthenticated = false;
            AppStores.loginStore.setErrors({
                username: "Username cannot be empty",
                password: "password cannot be empty",
                credential: ""
            });

            var loginForm = React.render(<Login store={AppStores.loginStore} />, document.body);
            expect(React.findDOMNode(loginForm.refs["usernameError"]).innerHTML).toEqual("Username cannot be empty");
            expect(React.findDOMNode(loginForm.refs["passwordError"]).innerHTML).toEqual("password cannot be empty");
            expect(React.findDOMNode(loginForm.refs["credentialError"]).innerHTML.length).toBe(0);
        });

        it("should call authenticate when login button is clicked, and form is valid", () => {
            //jsdom doesn't support html5 checkValidity..
            //tried pollyfilling using H5F, but react doesn't like it.
            HTMLFormElement.prototype.checkValidity = () => true;

            spyOn(LoginActions, 'authenticate');
            var loginForm = React.render(<Login store={AppStores.loginStore} />, document.body);
            ReactTestUtils.Simulate.click(React.findDOMNode(loginForm.refs["btnLogin"]));
            expect(LoginActions.authenticate).toHaveBeenCalled();
        });

        it("should call setErrors when login button is clicked, and form is invalid", () => {
            //jsdom doesn't support html5 checkValidity..
            //tried pollyfilling using H5F, but react doesn't like it.
            HTMLFormElement.prototype.checkValidity = () => false;

            spyOn(LoginActions, 'setErrors');

            var loginForm = React.render(<Login store={AppStores.loginStore} />, document.body);

            ReactTestUtils.Simulate.click(React.findDOMNode(loginForm.refs["btnLogin"]));

            expect(LoginActions.setErrors).toHaveBeenCalled();
        });

        it("should call LoginService.authenticate when login button is clicked, and form is valid", () => {
            HTMLFormElement.prototype.checkValidity = () => true;

            //We don't actually want to hit facebook in our unit test
            spyOn(LoginService.prototype, 'authenticate').and.returnValue(Promise.resolve({}));

            var loginForm = React.render(<Login store={AppStores.loginStore} />, document.body);

            ReactTestUtils.Simulate.click(React.findDOMNode(loginForm.refs["btnLogin"]));

            expect(LoginService.prototype.authenticate).toHaveBeenCalled();
        });

        it("should warn user when username/password is wrong", (done: Function) => {
            HTMLFormElement.prototype.checkValidity = () => true;

            var rejected = Promise.reject({});
            spyOn(LoginService.prototype, 'authenticate').and.returnValue(rejected);

            var loginForm = React.render(<Login store={AppStores.loginStore} />, document.body);

            ReactTestUtils.Simulate.click(React.findDOMNode(loginForm.refs["btnLogin"]));

            expect(LoginService.prototype.authenticate).toHaveBeenCalled();

            setTimeout(function() {
                rejected.catch(function() {
                    expect(AppStores.loginStore.errors.credential).toEqual("Invalid username/password");
                    done();
                })
            }, 10);
        });
    });

    beforeEach(function() {
        (global as any).document = jsdom.jsdom('<!doctype html><html><body></body></html>');
        (global as any).window = document.defaultView;
        (global as any).Element = (global as any).window.Element;
        (global as any).HTMLFormElement = (global as any).window.HTMLFormElement;
        (global as any).navigator = {
            userAgent: 'node.js'
        };

        React = require('react/addons');

        ReactTestUtils = React.addons.TestUtils;
    });

    afterEach(function(done) {
        React.unmountComponentAtNode(document.body)
        React = null;
        ReactTestUtils = null;
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
