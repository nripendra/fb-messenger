import * as React from 'react';
import Login from './login';
import Chat from './chat';
import AppStores from '../appstores';
import connectToStore from '../decorators/connectToStores';

@connectToStore(['loginStore'])
export default class App extends React.Component<any, any> {
    render() {

        if (!AppStores.loginStore.isAuthenticated) {
            return (<Login store={AppStores.loginStore} />);
        } else {
            return (<Chat store={AppStores.chatStore} api={AppStores.loginStore.api} />);
        }
    }
}
