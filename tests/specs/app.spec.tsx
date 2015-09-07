// /// <reference path="../../tools/typings/jasmine/jasmine.d.ts"/>
// import App from '../../src/components/app';
// import Chat from '../../src/components/chat';
// import Login from '../../src/components/login';
// import AppStores from '../../src/appstores';
//
// import * as jsdom from 'jsdom';
// let React:any = null;
// let ReactTestUtils:any = null;
// console.log("describing app");
// describe("App", () => {
//     it("should show login form", () => {
//       console.log("should show login form")
//         AppStores.loginStore.isAuthenticated = false;
//         var myApp = React.render(<App />, document.body);
//         expect(ReactTestUtils.scryRenderedComponentsWithType(myApp, Login).length).toBe(1);
//     });
//
//     it("should show chat component when loginStore.isAuthenticated is true", () => {
//         console.log("should show chat component when loginStore.isAuthenticated is true")
//         AppStores.loginStore.isAuthenticated = true;
//         AppStores.loginStore.api =
//         {
//             setOptions: () => { },
//             getCurrentUserId: () => { return "123" },
//         };
//         var myApp = React.render(<App />, document.body);
//         expect(ReactTestUtils.scryRenderedComponentsWithType(myApp, Chat).length).toBe(1);
//     });
//
//     beforeEach(function() {
//         console.log("before app spec");
//         (global as any).document = jsdom.jsdom('<!doctype html><html><body></body></html>');
//         (global as any).window = document.defaultView;
//         (global as any).XMLHttpRequest = (window as any).XMLHttpRequest;
//         (global as any).Element = (global as any).window.Element;
//         (global as any).navigator = {
//             userAgent: 'node.js'
//         };
//
//         // require('react/lib/ExecutionEnvironment').canUseDOM = true;
//         React = require('react/addons');
//         ReactTestUtils = React.addons.TestUtils;
//
//     });
//
//     afterEach(function(done) {
//         React = null;
//         ReactTestUtils = null;
//         (global as any).document.body.innerHTML = "";
//         (global as any).document = null;
//         (global as any).window = null;
//         (global as any).Element = null;
//         (global as any).navigator = null;
//         setTimeout(done)
//     });
// });
