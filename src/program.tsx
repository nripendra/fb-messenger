import * as React from 'react';
import App from './components/app';

export default class Program {
    static main() {
        React.render(<App />, document.body);
    }
}
