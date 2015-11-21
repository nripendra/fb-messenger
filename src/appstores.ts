import LoginStore from './stores/loginstore';
import ChatStore from './stores/chatstore';
import AutoUpdaterStore from "./stores/auto-updaterstore";

var AppStores = {
    'loginStore': new LoginStore(),
    'chatStore': new ChatStore(),
    "autoUpdaterStore": new AutoUpdaterStore()
};

export default AppStores;
