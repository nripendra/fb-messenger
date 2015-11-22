import dispatcher from "../appdispatcher";

export default {
    checkForUpdate() {
        dispatcher.dispatch("checkForUpdate");
    },
    setFileSize(filesize: number) {
        dispatcher.dispatch("setFileSize", filesize);
    },
    setError(error: any) {
        dispatcher.dispatch("setError", error);
    },
    setDownloadProgress(progress: number) {
        dispatcher.dispatch("setDownloadProgress", progress);
    },
    setShowUpdaterStatus(showUpdaterStatus: boolean) {
        dispatcher.dispatch("setShowUpdaterStatus", showUpdaterStatus);
    },
    showInstallerAndRestartConfirmation(pathOfInstaller: string) {
        console.log("dispatching showInstallerAndRestartConfirmation..");
        dispatcher.dispatch("setShowInstallerAndRestartConfirmation", pathOfInstaller, true);
    },
    hideInstallerAndRestartConfirmation() {
        dispatcher.dispatch("setShowInstallerAndRestartConfirmation", "", false);
    },
    showRestartConfirmation() {
        dispatcher.dispatch("setShowRestartConfirmation", true);
    },
    hideRestartConfirmation() {
        dispatcher.dispatch("setShowRestartConfirmation", false);
    },
    launchInstaller() {
        dispatcher.dispatch("launchInstaller");
    },
    updateFeedDownloaded() {
        dispatcher.dispatch("updateFeedDownloaded");
    }
};
