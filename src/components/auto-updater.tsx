import * as React from "react";

import AutoUpdaterActions from "../actions/auto-updateractions";
import AppStores from "../appstores";
import connectToStore from "../decorators/connectToStores";

const Snackbar = require("material-ui/lib/snackbar");
const LinearProgress = require("material-ui/lib/linear-progress");

@connectToStore(["autoUpdaterStore"])
export default class AutoUpdater extends React.Component<any, any> {
    constructor(props: any) {
        super();
        this.props = props;
        AutoUpdaterActions.checkForUpdate();
    }

    _handleLaunchInstaller() {
        AutoUpdaterActions.hideInstallerAndRestartConfirmation();
        AutoUpdaterActions.launchInstaller();
    }

    _restart() {
        AutoUpdaterActions.hideRestartConfirmation();
        // restart logic here...
    }

    render() {
        var store = AppStores.autoUpdaterStore;
        if(store.showUpdaterStatus) {
            if(store.showInstallerAndRestartConfirmation) {
                return ( <Snackbar
                            message="An update is downloaded."
                            action="Install"
                            openOnMount={true}
                            autoHideDuration={20000}
                            onActionTouchTap={this._handleLaunchInstaller}/>);
            } else if (store.showRestartConfirmation) {
                return (<Snackbar
                            message="Application has been updated."
                            action="Restart"
                            autoHideDuration={20000}
                            openOnMount={true}
                            onActionTouchTap={this._restart}/>);
            } else if(store.isCheckingForUpdate) {
                return <LinearProgress mode="indeterminate" />;
            } else {
                return <LinearProgress mode="determinate" value={store.downloadProgress} />;
            }
        } else {
            return <div />;
        }
    }

}
