// Exercise 1 template
// Feel freee to modify it or create your own template

// playback controls
var pauseButton;
var playButton;
var stopButton;
var skipStartButton;
var skipEndButton;
var loopButton;
var recordButton;

let mic, recorder, soundFile;
let state = 0;
var mySound;

let filter;
let filterDryWet;
let filterOutput;

let filterFreq;
let filterRes;

let filterLowPass;
let filterWaveShaperDistortion;
let delay;
let filterDynComp;
let reverb;

let fftIn;
let fftOut;

// low-pass filter
var lp_cutOffSlider;
var lp_resonanceSlider;
var lp_dryWetSlider;
var lp_outputSlider;

// dynamic compressor
var dc_attackSlider;
var dc_kneeSlider;
var dc_releaseSlider;
var dc_ratioSlider;
var dc_thresholdSlider;
var dc_dryWetSlider;
var dc_outputSlider;

// master volume
var mv_volumeSlider;

// reverb
var rv_durationSlider;
var rv_decaySlider;
var rv_dryWetSlider;
var rv_outputSlider;
var rv_reverseButton;

// waveshaper distortion
var wd_amountSlider;
var wd_oversampleSlider;
var wd_dryWetSlider;
var wd_outputSlider;

function preload(){
    soundFormats('mp3', 'wav')
    mySound = loadSound('my_recording_edited.wav');
}


function setup() {
  createCanvas(800, 600);
  background(180);
    
  // 
  filterLowPass = new p5.LowPass();

  // 
  filterWaveShaperDistortion = new p5.Distortion();
    
   // 
  delay = new p5.Delay();
    
    //
  filterDynComp = new p5.Compressor();
    
    // 
  reverb = new p5.Reverb();


    fftIn = new p5.FFT(0.2,2048);
    fftOut = new p5.FFT(0.2,2048);
    
 //chaining test
    chainTest = filterLowPass.chain(filterWaveShaperDistortion, filterDynComp, reverb);
    mySound.disconnect();
    mySound.connect(chainTest);
    
    
  // create an audio in
  mic = new p5.AudioIn();

  // users must manually enable their browser microphone for recording to work properly!
  mic.start();

  // create a sound recorder
  recorder = new p5.SoundRecorder();

  // connect the mic to the recorder
  recorder.setInput(mic);

  // create an empty sound file that we will use to playback the recording
  soundFile = new p5.SoundFile();
  
  
  gui_configuration();
}


function playSong() {
    mySound.play();
}

function pauseSong() {
    mySound.pause();
}

function stopSong() {
    mySound.stop();
}

function loopSong() {
        mySound.loop();
    if(loopState == false && mySound.isLooping()) {
        console.log("Loop starts")
        loopState = true;
    }
    else if(loopState) {
        mySound.setLoop(false);
        console.log("Loop stops")
        loopState = false;
    }
}

function skipToStart() {
    let dur = mySound.duration();
    let b = 0 * (dur);
    mySound.jump(b);
    console.log(b);
}

function skipToEnd() {
    let dur = mySound.duration();
    mySound.jump(dur);
    console.log(dur);
    mySound.stop();
}

function recordSave() {
  // use the '.enabled' boolean to make sure user enabled the mic (otherwise we'd record silence)
  if (state == 0) {
    // Tell recorder to record to a p5.SoundFile which we will use for playback
    recorder.record(soundFile);
    console.log("Recording Started")
    state++;
  } 
    else if (state == 1) {
    recorder.stop(); // stop recorder, and send the result to soundFile
    save(soundFile,'myVoice.wav');
    console.log("Recording ended. Saved")
    state == 0;
  }
  
}

function reverbReverse() {
    if(state == 0) {
        reverb.set(rv_durationSlider.value(), rv_decaySlider.value(), true);
        state++;
    }
    else if (state == 1) {
        reverb.set(rv_durationSlider.value(), rv_decaySlider.value(), false);
    }
}


function draw() {
    
    //master volume
    mySound.setVolume(mv_volumeSlider.value());
    
    
    //frequency (10Hz) to the highest (22050Hz) that humans can hear
    filterFreq = map(lp_cutOffSlider.value(), 0, 100, 10, 22050);
    //Map to resonance (volume boost) at the cutoff frequency
    filterRes = map(lp_resonanceSlider.value(), 0, 100, 15, 5);
    //set filter parameters
    filterLowPass.set(filterFreq, filterRes);
    filterLowPass.drywet(lp_dryWetSlider.value());
    filterLowPass.amp(lp_outputSlider.value());
    
    //dynamic compressor
    filterDynComp.attack(dc_attackSlider.value());
    filterDynComp.knee(dc_kneeSlider.value());
    filterDynComp.release(dc_releaseSlider.value());
    filterDynComp.ratio(dc_ratioSlider.value());
    filterDynComp.threshold(dc_thresholdSlider.value());
    filterDynComp.drywet(dc_dryWetSlider.value());   
    filterDynComp.amp(dc_outputSlider.value());
    
    //reverb
    
    reverb.drywet(rv_dryWetSlider.value());
    reverb.amp(rv_outputSlider.value());
    
    //waveshaper distortion
    if(wd_oversampleSlider.value()==0){
        filterWaveShaperDistortion.set(wd_amountSlider.value(), + "none");
    }
    else {
        filterWaveShaperDistortion.set(wd_amountSlider.value(), str(wd_oversampleSlider.value()) + "x");
    }
    
    filterWaveShaperDistortion.drywet(wd_dryWetSlider.value());
    filterWaveShaperDistortion.amp(wd_outputSlider.value());
    
    //delay
    delay.filter(filterFreq, filterRes);
    
    fftIn.setInput(mySound);
    
    fftOut.setInput();
    
    spectrumIn();
    spectrumOut();
    
}

function spectrumIn() {
    
    let spectrum = fftIn.analyze();
    
    translate(510, 205);
    scale(0.33, 0.20);
    noStroke();
    fill(60);
    rect(0, 0, width, height);
    fill(255, 0, 0);
    for (let i = 0; i < spectrum.length; i++) {
        let x = map(i, 0, spectrum.length, 0, width);
        let h = -height + map(spectrum[i], 0, 255, height, 0);
        rect(x, height, width / spectrum.length, h);
    }
}

function spectrumOut() {
    let spectrum = fftOut.analyze();
    
    translate(0, 800);
    
    noStroke();
    fill(60);
    rect(0, 0, width, height);
    fill(255, 0, 0);
    for (let i = 0; i < spectrum.length; i++) {
        let x = map(i, 0, spectrum.length, 0, width);
        let h = -height + map(spectrum[i], 0, 255, height, 0);
        rect(x, height, width / spectrum.length, h);
    }
}

function gui_configuration() {
    
    
  // Playback controls
  pauseButton = createButton('pause');
  pauseButton.position(10, 20);
    pauseButton.mousePressed(pauseSong);

    
  playButton = createButton('play');
  playButton.position(70, 20);
    playButton.mousePressed(playSong);
    
    
  stopButton = createButton('stop');
  stopButton.position(120, 20);
    stopButton.mousePressed(stopSong);
    
  skipStartButton = createButton('skip to start');
  skipStartButton.position(170, 20);
    skipStartButton.mousePressed(skipToStart);
    
    
  skipEndButton = createButton('skip to end');
  skipEndButton.position(263, 20);
    skipEndButton.mousePressed(skipToEnd);
    
    
  loopButton = createButton('loop');
  loopButton.position(352, 20);
    loopButton.mousePressed(loopSong);
    
    
  recordButton = createButton('record');
  recordButton.position(402, 20);
    recordButton.mousePressed(recordSave);
  
  // Important: you may have to change the slider parameters (min, max, value and step)
  
  // low-pass filter
  textSize(14);
  text('low-pass filter', 10,80);
  textSize(10);
  lp_cutOffSlider = createSlider(0, 1, 0.5, 0.01);
  lp_cutOffSlider.position(10,110);
  text('cutoff frequency', 10,105);
  lp_resonanceSlider = createSlider(0, 1, 0.5, 0.01);
  lp_resonanceSlider.position(10,155);
  text('resonance', 10,150);
  lp_dryWetSlider = createSlider(0, 1, 0.5, 0.01);
  lp_dryWetSlider.position(10,200);
  text('dry/wet', 10,195);
  lp_outputSlider = createSlider(0, 1, 0.5, 0.01);
  lp_outputSlider.position(10,245);
  text('output level', 10,240);
  
  // dynamic compressor
  textSize(14);
  text('dynamic compressor', 210,80);
  textSize(10);
  dc_attackSlider = createSlider(0, 1, 0.003, 0.01);
  dc_attackSlider.position(210,110);
  text('attack', 210,105);
  dc_kneeSlider = createSlider(0, 40, 30, 0.01);
  dc_kneeSlider.position(210,155);
  text('knee', 210,150);
  dc_releaseSlider = createSlider(0, 1, 0.25, 0.01);
  dc_releaseSlider.position(210,200);
  text('release', 210,195);
  dc_ratioSlider = createSlider(1, 20, 12, 0.01);
  dc_ratioSlider.position(210,245);
  text('ratio', 210,240);
  dc_thresholdSlider = createSlider(-100, 0, -24, 0.01);
  dc_thresholdSlider.position(360,110);
  text('threshold', 360,105);
  dc_dryWetSlider = createSlider(0, 1, 0.5, 0.01);
  dc_dryWetSlider.position(360,155);
  text('dry/wet', 360,150);
  dc_outputSlider = createSlider(0, 1, 0.5, 0.01);
  dc_outputSlider.position(360,200);
  text('output level', 360,195);
  
  // master volume
  textSize(14);
  text('master volume', 560,80);
  textSize(10);
  mv_volumeSlider = createSlider(0, 1, 0.5, 0.01);
  mv_volumeSlider.position(560,110);
  text('level', 560,105)

  // reverb
  textSize(14);
  text('reverb', 10,305);
  textSize(10);
  rv_durationSlider = createSlider(0, 10, 0, 0.01);
  rv_durationSlider.position(10,335);
  text('duration', 10,330);
  rv_decaySlider = createSlider(0, 100, 2, 1);
  rv_decaySlider.position(10,380);
  text('decay', 10,375);
  rv_dryWetSlider = createSlider(0, 1, 0, 0.01);
  rv_dryWetSlider.position(10,425);
  text('dry/wet', 10,420);
  rv_outputSlider = createSlider(0, 1, 0, 0.01);
  rv_outputSlider.position(10,470);
  text('output level', 10,465);
  rv_reverseButton = createButton('reverb reverse');
  rv_reverseButton.position(10, 510);
    rv_reverseButton.mousePressed(reverbReverse);
  
  // waveshaper distortion
  textSize(14);
  text('waveshaper distortion', 210,305);
  textSize(10);
  wd_amountSlider = createSlider(0, 1, 0.5, 0.01);
  wd_amountSlider.position(210,335);
  text('distortion amount', 210,330);
  wd_oversampleSlider = createSlider(0, 1, 0.5, 0.01);
  wd_oversampleSlider.position(210,380);
  text('oversample', 210,375);
  wd_dryWetSlider = createSlider(0, 1, 0.5, 0.01);
  wd_dryWetSlider.position(210,425);
  text('dry/wet', 210,420);
  wd_outputSlider = createSlider(0, 1, 0.5, 0.01);
  wd_outputSlider.position(210,470);
  text('output level', 210,465);
  
  // spectrums
  textSize(14);
  text('spectrum in', 560,200);
  text('spectrum out', 560,345);
}