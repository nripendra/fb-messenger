import * as semver from "semver";

let electronRequire: Function = (global as any).electronRequire || function () {return;};

export default class AutoUpdate {
	private URL:string = "https://api.github.com/repos/atom/electron/releases";
	// "https://api.github.com/repos/nripendra/fb-messenger/releases"
	checkForUpdate() {
		let app = electronRequire("remote").require("app");
		let version = app.getVersion();
		let request = new XMLHttpRequest();
		let allowPrerelease = true;// get from settings.

		request.onerror = (function(a: any) {
			console.log("problem looking for update..");
			this.recheckAfter(10 * 60 * 1000);// 10mins.
		}).bind(this);

		request.onreadystatechange = (function() {
			if (request.readyState === 4 && request.status === 200) {
				let recheckTimeout = 1 * 60 * 60 * 1000;// 1hr
				let releases = JSON.parse(request.responseText) || [];
				let latestRelease = (releases.length > 0) ? releases[0] : {tag_name: "0.0.0", prelease: true, assets:[]};
				let eligible = semver.gt(latestRelease.tag_name, version);

				eligible = eligible && (allowPrerelease || (latestRelease.prelease === false));

				if(eligible) {
					if(latestRelease.assets && latestRelease.assets.length > 0) {
						for(let asset of latestRelease.assets) {
							// will support platform and processor architecture somewhere in future... 
							if(asset.name.match(process.platform)) {
								if(asset.state === "uploaded") {
									let downloadUrl = asset.browser_download_url;
									console.log("new version available, start downloading from " + downloadUrl);
									recheckTimeout = 6 * 60 * 60 * 1000;// 6hr
								} else {
									// assets is uploading but not completed yet, check after 5 mins.
									recheckTimeout = 5 * 60 * 1000;// 5min
								}
							}
						}
					} else {
						// release has been created but there isn't any asset yet, wait for 5 more mins.
						recheckTimeout = 5 * 60 * 1000;// 5min
					}
				}
				this.recheckAfter(recheckTimeout);
			}
		}).bind(this);
		request.open("GET", this.URL, true);
		request.send();
	}

	recheckAfter(milliseconds: number) {
		setTimeout((() => {
			this.checkForUpdate();
		}).bind(this), milliseconds);
	}
}