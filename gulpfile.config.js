'use strict';
var GulpConfig = (function () {
    function GulpConfig() {
        this.source = './src/';

        this.tsOutputPath = './out/js/';
        this.allTypeScript = this.source + '/**/*.{ts,tsx}';

        this.typings = './tools/typings/';
        this.libraryTypeScriptDefinitions = './tools/typings/**/*.ts';
        this.appTypeScriptReferences = this.typings + 'fbMessengerApp.d.ts';

        this.compiled = './out/compile'
    }
    return GulpConfig;
})();
module.exports = GulpConfig;