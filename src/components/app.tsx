import * as React from 'react';
import Login from './login';
import Chat from './chat';
import AutoUpdater from "./auto-updater";
import AppStores from '../appstores';
import connectToStore from '../decorators/connectToStores';
import electronRequire from "../electronRequire";

@connectToStore(['loginStore'])
export default class App extends React.Component<any, any> {
    isMaximizedOnce: boolean = false;
    componentDidUpdate() {
        if (AppStores.loginStore.isAuthenticated && !this.isMaximizedOnce) {
            this.isMaximizedOnce = true;
    
            let remote = electronRequire("remote");
            let currentWindow = remote.getCurrentWindow();
            if (!currentWindow.isMaximized()) {
                currentWindow.maximize();
            }
        }
    }

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
