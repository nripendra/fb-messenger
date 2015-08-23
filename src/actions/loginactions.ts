import dispatcher from '../appdispatcher';
import {ILoginErrors, ICredential} from "../stores/loginstore";

export default {
    authenticate(credential: ICredential): void {
        dispatcher.dispatch('authenticate', credential);
    },
    setErrors(errors: ILoginErrors): void {
        dispatcher.dispatch('setErrors', errors);
    },
    reset(): void {
        dispatcher.dispatch('reset', null);
    }
};
