import * as React from 'react';
import * as ReactDom from 'react-dom';
import App from './components/app';

class Program {
    static main() {
        ReactDom.render(<App />, document.getElementById("fb-messenger"));
    }
}

window['Program'] = Program;

export default Program;