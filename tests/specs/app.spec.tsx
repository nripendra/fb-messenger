/// <reference path="../../tools/typings/jasmine/jasmine.d.ts"/>
import App from '../../src/components/app';
import Login from '../../src/components/login';

import * as jsdom from 'jsdom';
let React = require('react/addons');
let ReactTestUtils = React.addons.TestUtils;

describe("App", () => {
    it("should show login form", () => {

        var myApp = React.render(<App />, document.body);
        expect(ReactTestUtils.scryRenderedComponentsWithType(myApp, Login).length).toBe(1);
    });

    beforeEach(function() {
        (global as any).document = jsdom.jsdom('<!doctype html><html><body></body></html>');
        (global as any).window = document.defaultView;
        (global as any).Element = (global as any).window.Element;
        (global as any).navigator = {
            userAgent: 'node.js'
        };
    });

    afterEach(function(done) {
        (global as any).document = null;
        (global as any).window = null;
        (global as any).Element = null;
        (global as any).navigator = {
            userAgent: 'node.js'
        };
        setTimeout(done)
    });
});
