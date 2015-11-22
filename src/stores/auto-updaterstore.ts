import {Store} from "delorean";
import AutoUpdateService from "../services/auto-updateservice";

export default class AutoUpdaterStore extends Store {
    isCheckingForUpdate: boolean;
    isDownloading: boolean;
    autoUpdateService: AutoUpdateService;
    fileSize: number;
    downloadProgress: number;
    error: any;
    showUpdaterStatus: boolean;
    pathOfInstaller: string;
    showInstallerAndRestartConfirmation: boolean;
    showRestartConfirmation: boolean;

    constructor() {
        super();
        this.autoUpdateService = new AutoUpdateService();
    }

    get actions() {
        return {
            "checkForUpdate": "checkForUpdate",
            "updateFeedDownloaded": "updateFeedDownloaded",
            "setFileSize": "setFileSize",
            "setError": "setError",
            "setDownloadProgress": "setDownloadProgress",
            "setShowUpdaterStatus": "setShowUpdaterStatus",
            "setShowInstallerAndRestartConfirmation": "setShowInstallerAndRestartConfirmation",
            "setShowRestartConfirmation": "setShowRestartConfirmation",
            "launchInstaller": "launchInstaller"
        };
    }

    checkForUpdate() {
        this.autoUpdateService.checkForUpdate();
        this.isCheckingForUpdate = true;
        this.emit("change");
    }

    updateFeedDownloaded() {
        this.isCheckingForUpdate = false;
        this.emit("change");
    }

    setFileSize(fileSize: number) {
        this.fileSize = fileSize;
        this.emit("change");
    }

    setError(error: number) {
        this.error = error;
        this.emit("change");
    }

    setDownloadProgress(progress: number) {
        this.isDownloading = progress !== 100;
        this.downloadProgress = progress;
        console.log(this.downloadProgress);
        this.emit("change");
    }

    setShowUpdaterStatus(showUpdaterStatus: boolean) {
        this.showUpdaterStatus = showUpdaterStatus;
        this.emit("change");
    }

    setShowInstallerAndRestartConfirmation(pathOfInstaller: string, showInstallerAndRestartConfirmation?: boolean) {
        console.log("received setShowInstallerAndRestartConfirmation");
        this.pathOfInstaller = pathOfInstaller;
        this.showInstallerAndRestartConfirmation = showInstallerAndRestartConfirmation !== false;
        console.log("this.showInstallerAndRestartConfirmation =" + this.showInstallerAndRestartConfirmation);
        this.emit("change");
    }

    setShowRestartConfirmation(showRestartConfirmation?: boolean) {
        this.showRestartConfirmation = showRestartConfirmation !== false;
        this.emit("change");
    }

    launchInstaller() {
        this.autoUpdateService.launchInstaller(this.pathOfInstaller);
    }

    getState() {
        return {
            isCheckingForUpdate: this.isCheckingForUpdate,
            isDownloading: this.isDownloading,
            downloadProgress: this.downloadProgress,
            fileSize: this.fileSize,
            error: this.error
        };
    }
}
