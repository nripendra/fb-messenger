import * as React from 'react';
import Login from './login';
import AppStores from '../appstores';
import connectToStore from '../decorators/connectToStores';

@connectToStore(['loginStore'])
export default class App extends React.Component<any, any> {
    render() {
      return (<Login store={AppStores.loginStore} />);
    }
}
