import LoginStore from './stores/loginstore';
import ChatStore from './stores/chatstore';

var AppStores = {
    'loginStore': new LoginStore(),
    'chatStore': new ChatStore()
};

export default AppStores;
