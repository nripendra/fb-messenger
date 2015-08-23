import {Dispatcher} from 'delorean';
import AppStores from './appstores';

Dispatcher.dispatcher = new Dispatcher(AppStores);
export default Dispatcher.dispatcher;
