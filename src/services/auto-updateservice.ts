import * as semver from "semver";
import AutoUpdaterActions from "../actions/auto-updateractions";

export class Time {
	public static _5Minutes:number = 5 * 60 * 1000;
	public static _10Minutes:number = 10 * 60 * 1000;
	public static _1Hour:number = 1 * 60 * 60 * 1000;
	public static _6Hours:number = 6 * 60 * 60 * 1000;
}

export default class AutoUpdateService {
	private checkForUpdateSchedule: Array<number>;
	private URL:string = "https://api.github.com/repos/nripendra/fb-messenger/releases";
	// "https://api.github.com/repos/TryGhost/Ghost/releases";
	public electronRequire:Function;// for supporting DI, not sure how else to do it. 
	constructor() {
		this.checkForUpdateSchedule = new Array<number>();
		this.electronRequire = (global as any).electronRequire || function () {return;};
	}

	checkForUpdate() {
		let app = this.electronRequire("remote").require("app");
		let version = app.getVersion();
		let request = new XMLHttpRequest();
		let allowPrerelease = true;// get from settings.

		request.onerror = (function(error: any) {
			this.onNetworkError(1, error);
		}).bind(this);

		request.onreadystatechange = (function() {
			if (request.readyState === 4 && request.status === 200) {
				console.log("Completed downloading update feed");
				let recheckTimeout = Time._1Hour;
				let releases = JSON.parse(request.responseText) || [];
				let latestRelease = (releases.length > 0) ? releases[0] : {tag_name: "0.0.0", prelease: true, assets:[]};
				let eligible = semver.gt(latestRelease.tag_name, version);
				eligible = eligible && (allowPrerelease || (latestRelease.prelease === false));
				eligible = eligible && ((latestRelease.assets || []).length > 0);
				var assetFound:boolean = false;

				if(eligible) {
					console.log("There is newer version than the currently installed one. Checking for downlodable installer...");
					for(let asset of latestRelease.assets || []) {
						if(this.checkPlatform(asset)) {
							if(asset.state === "uploaded") {
								assetFound = true;
								this.download(asset);
								recheckTimeout = Time._6Hours;
								break;
							}
						}
					}
				}

				if(!assetFound) {
					console.log("No assets found for download");
					recheckTimeout = Time._5Minutes;
					AutoUpdaterActions.updateFeedDownloaded();
					AutoUpdaterActions.setDownloadProgress(100);
				}
				this.recheckAfter(recheckTimeout);
			}
		}).bind(this);
		request.open("GET", this.URL, true);
		console.log("Checking for updates...");
		request.send();
	}

	timeoutErrorRetryCount = 0;
	onNetworkError(state:number, error:any) {
		if(/ETIMEDOUT/.test(error)) {
			if(this.timeoutErrorRetryCount < 3) {
				this.recheckAfter(0);
				this.timeoutErrorRetryCount++;
				console.log("Retrying.. " + this.timeoutErrorRetryCount);
				return;
			}
		}

	    this.timeoutErrorRetryCount = 0;
		var verb = state === 1 ? "looking" : "downloading";
		console.log("problem " + verb + " for update. Will recheck in next 10 mins...");
		if(error != null) {
			console.log(error);
		}
		AutoUpdaterActions.updateFeedDownloaded();
		AutoUpdaterActions.setDownloadProgress(100);
		this.recheckAfter(Time._10Minutes);// 10mins.
	}

	checkPlatform(asset:any){
		// will support platform and processor architecture somewhere in future... 
		//return asset.name.match(process.platform) && asset.name.match(process.arch);
		return true;
	}

	recheckAfter(milliseconds: number) {
		console.log("scheduling next check for update");
		// don't schedule multiple check for update on same time.
		var index = this.checkForUpdateSchedule.indexOf(milliseconds);
		if(index === -1) {
			setTimeout((() => {
				this.checkForUpdateSchedule = this.checkForUpdateSchedule.splice(index, 1);
				this.checkForUpdate();
			}).bind(this), milliseconds);
			this.checkForUpdateSchedule.push(milliseconds);
		} else {
			console.log("Already scheduled at this time");
		}
	}

	launchInstaller(pathOfInstaller: string) {
		console.log("launching " + pathOfInstaller + "...");
		let exec = this.electronRequire("child_process").exec;
		exec(pathOfInstaller);
	}

	launchScheduledInstallerTask(asset: any) {
		console.log("Launching installer...");
		let exec = this.electronRequire("child_process").exec;
		// @important!! this value depends upon installer script. If changed in installer script remember to change here too.
		let taskName = "exec-fb-messenger-setup";
		exec("schtasks /RUN /TN " + taskName, function (error: any, stdout: any, stderr: any) {
			console.log("stdout: " + stdout);
			if(stderr) {
				console.log("stderr: " + stderr);
			}
			if (error !== null) {
				console.log("exec error: " + error);
				if((/The system cannot find the file specified/gm).test(error)) {
					console.log("Scheduled task not found! Ask user to launch the installer..");
					let remote = this.electronRequire("remote");
					let app = remote.require("app");
					let path = remote.require("path");

					let dataDir = app.getDataPath();
					let downloadPath = path.join(dataDir, asset.name);
					// somehow the scheduled task to execute the installer is missing. Show user confirmation to 
					// launch the installer. Handle launching installer there. 
					AutoUpdaterActions.showInstallerAndRestartConfirmation(downloadPath);
				}
			} else {
				AutoUpdaterActions.showRestartConfirmation();
			}
		}.bind(this));
	}

	download(asset:any) {
		const FastDownload = this.electronRequire("fast-download");
		let interval:any = 0;
		let remote = this.electronRequire("remote");
		let path = remote.require("path");
		let app = remote.require("app");
		let downloadUrl = asset.browser_download_url;
		let dataDir = app.getDataPath();
		let downloadPath = path.join(dataDir, asset.name);
		// support resuming previous download
		console.group("downloading...")
		console.log("Configuring download");
		AutoUpdaterActions.setFileSize((Math.floor(asset.size/1024/1024*100)/100));
		let dl = new FastDownload(downloadUrl, {destFile: downloadPath, content_type: asset.content_type, file_size: asset.size, accept_ranges: true});
		dl.on("error", function(error:any){
			clearInterval(interval);
			this.onNetworkError(2, error);
		}.bind(this));

		dl.on("start", function(dl:any){
			AutoUpdaterActions.updateFeedDownloaded();
			AutoUpdaterActions.setDownloadProgress(0);
			console.log("started downloading from " + downloadUrl + " to " + downloadPath);
		});

		dl.on("progress", function(downloaded: number){
			console.log("completed dowloading: %d", (Math.floor(dl.downloaded/dl.size*10000)/100));
			AutoUpdaterActions.setDownloadProgress((Math.floor(dl.downloaded/dl.size*10000)/100));
		});

		dl.on("end", function(){
			AutoUpdaterActions.setDownloadProgress(100);
			this.launchScheduledInstallerTask(asset);
			clearInterval(interval);
			console.groupEnd();
		}.bind(this));
	}
}