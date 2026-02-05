const audioContext = new AudioContext();


let audio;
let source;

const input = document.getElementById("fileInput");

input.addEventListener("change", ()=>{
    if (audioContext.state === "suspended"){
        audioContext.resume();
    }
    const file = input.files[0];
    const url = URL.createObjectURL(file);
    audio = new Audio(url);
    source = audioContext.createMediaElementSource(audio);
    

    // source.connect(audioContext.destination);

    source.connect(convolver);
    convolver.connect(audioContext.destination);
    

    audio.loop = true;
    audio.playbackRate  = speed;
    audio.play(); 
})


// SPEED
const speedControl = document.getElementById('speedControl');
const speed = speedControl.value;

setInterval(()=>{
    speedControl.value = Math.floor((Math.random()* 3) + 0.1);
    if(audio){
        audio.playbackRate = speedControl.value;
    }
    
}, 500)

// RANDOMPART
let randomize = false;

function randomBtn(){
    randomize = true;
    document.getElementById('randomJumpIntervalControl').style.opacity = '1';
}

function randomOff(){
    randomize = false;
    document.getElementById('randomJumpIntervalControl').style.opacity = '0.2';
}

function jumpToRandomPart() {

    if(randomize === true){

        const randomTime = Math.random() * (audio.duration - 1);
        audio.currentTime = randomTime;
        audio.play();

        // LOOP AT RANDOM PART

        const loopEndTime = randomTime + 1; 
        
        audio.ontimeupdate = function () {
        
            if (audio.currentTime >= loopEndTime) {
                audio.currentTime = randomTime; 
            }
        };

    } else {
        audio.ontimeupdate = null;
    }

}

// SLIDER TO CHANGE TIME BETWEEN RANDOM JUMPS

const jumpIntervalControl = document.getElementById('randomJumpIntervalControl');
let jumpInterval = jumpIntervalControl.value;
let intervalId = setInterval(jumpToRandomPart, jumpInterval);

jumpIntervalControl.addEventListener('input', updateInterval);

function updateInterval(){
    jumpInterval = jumpIntervalControl.value;

    clearInterval(intervalId);
    intervalId = setInterval(jumpToRandomPart, jumpInterval);
}


//DISTORTION

const distortion = audioContext.createWaveShaper();

function distBtn(){
    source.connect(distortion);
    distortion.connect(convolver);

    
    convolver.connect(audioContext.destination);
    // document.getElementById('distP').innerHTML = 'ᛗᛗᛤ ᛣ ᛭᛭᛭᛭ ᛰ';
}

function distOff(){
    distortion.disconnect();
    // document.getElementById('distP').innerHTML = '';
}

let distAmount;

setInterval(()=>{
    distAmount = Math.floor((Math.random()* 100) + 1);
    distortion.curve = makeDistortionCurve(distAmount);
}, 1000);


function makeDistortionCurve(amount) {
  const k = typeof amount === "number" ? amount : 50;
  const numSamples = 44100;
  const curve = new Float32Array(numSamples);
  const deg = Math.PI / 180;

  for (let i = 0; i < numSamples; i++) {
    const x = (i * 2) / numSamples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

// DELAY

const delayNode = audioContext.createDelay();
const feedbackGainNode = audioContext.createGain();

feedbackGainNode.gain.setValueAtTime(0.5, audioContext.currentTime); 
// 0.5 IS 50% FEEDBACK

function updateDelayTime() {
    delaySeconds = Math.random() * 0.9 + 0.1;
    delayNode.delayTime.setValueAtTime(delaySeconds, audioContext.currentTime);    
}
updateDelayTime();

setInterval(updateDelayTime, 1000);

function delayBtn(){
    source.connect(delayNode);
    delayNode.connect(feedbackGainNode);
    feedbackGainNode.connect(delayNode);

    delayNode.connect(audioContext.destination);

    // document.getElementById('delayP').innerHTML = 'ᛒ ᛏᛓ';

}

function delayOff(){
    delayNode.disconnect();

    // document.getElementById('delayP').innerHTML = '';
}

delayNode.delayTime.setValueAtTime(delaySeconds, audioContext.currentTime);



// REVERB

function impulseResponse(duration, decay){
    let length = audioContext.sampleRate * duration;
    let impulse = audioContext.createBuffer(1,length,audioContext.sampleRate);
    let IR = impulse.getChannelData(0);
    for (let i = 0; i < length; i++){
        IR[i] = (2*Math.random() - 1) * Math.pow(1 - i/length *0.5, decay);
       
    }
     return impulse;
}

const impulse = impulseResponse(1,2);
const convolver = new ConvolverNode(audioContext, {buffer:impulse});















