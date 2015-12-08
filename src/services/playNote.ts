var win = window as any;
// if you have another AudioContext class use that one, as some browsers have a limit
var context = new (win.AudioContext || win.webkitAudioContext || win.audioContext);

// @ref: http://code.tutsplus.com/tutorials/the-web-audio-api-adding-sound-to-your-web-app--cms-23790
var playNote = function (frequency:number, startTime:number, duration:number, gain?: number, type?: string, callback?: Function) {
    var osc1 = context.createOscillator(),
        osc2 = context.createOscillator(),
        volume = context.createGain();
 
    type = type || "triangle";
    gain = gain || 0.1;
    // Set oscillator wave type
    osc1.type = type;
    osc2.type = type;
 
    volume.gain.value = gain;    
 
    // Set up node routing
    osc1.connect(volume);
    osc2.connect(volume);
    volume.connect(context.destination);
 
    // Detune oscillators for chorus effect
    osc1.frequency.value = frequency + 1;
    osc2.frequency.value = frequency - 2;
 
    // Fade out
    volume.gain.setValueAtTime(gain, startTime + duration - 0.05);
    volume.gain.linearRampToValueAtTime(0, startTime + duration);
 
    if (callback){osc2.onended = callback;}
    
    // Start oscillators
    osc1.start(startTime);
    osc2.start(startTime);
 
    // Stop oscillators
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
};

export {context, playNote};