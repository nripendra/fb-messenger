import * as React from 'react';
import Login from './login';
import Chat from './chat';
import AutoUpdater from "./auto-updater";
import AppStores from '../appstores';
import connectToStore from '../decorators/connectToStores';

@connectToStore(['loginStore'])
export default class App extends React.Component<any, any> {
    render() {

        if (!AppStores.loginStore.isAuthenticated) {
            return (<div>
                    <AutoUpdater />
                    <Login store={AppStores.loginStore} />
            </div>);
        } else {
            return (<div>
                    <AutoUpdater />
                    <Chat store={AppStores.chatStore} api={AppStores.loginStore.api} />
            </div>);
        }
    }
}
