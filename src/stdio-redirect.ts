//@ref = https://github.com/atom/electron/blob/master/atom/browser/lib/init.coffee
var streamWrite = function(chunk: any, encoding: any, callback: Function){
     if(Buffer.isBuffer(chunk)){
	 	chunk = chunk.toString(encoding);
	 }
    console.log(chunk)
    if(callback)callback()
    return true;
};

(process.stdout as any).write = streamWrite;   
(process.stderr as any).write = streamWrite;
