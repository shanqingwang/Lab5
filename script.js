// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const canvas = document.getElementById("user-image");
const ctx = canvas.getContext('2d');
const button_submit = document.querySelector('button[type="submit"]')
const button_clear = document.querySelector("button[type='reset']")
const button_read = document.querySelector("button[type='button']")
const input = document.getElementById("image-input");
const form = document.getElementById("generate-meme");
const text_top = document.getElementById("text-top");
const text_bottom = document.getElementById("text-bottom");
const voice_selection = document.getElementById("voice-selection");
const synth = window.speechSynthesis;
const volume_slider = document.querySelector('input[type="range"]');
const volume_group = document.querySelector('div[id="volume-group"]');
const volume_icon = volume_group.querySelector('img');

// populate voices with options, from mozilla dev pages
var voices = [];
console.log(synth.getVoices())
function populateVoiceList() {
  voices = synth.getVoices();

  // clear list
  var length = voice_selection.options.length; 
  for (i = length-1; i >= 0; i--) {
    voice_selection.options[i] = null;
  }

  for(var i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voice_selection.appendChild(option);
  }
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}
voice_selection.disabled = false;


// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // TODO
  ctx.clearRect(0,0,canvas.width,canvas.height);
  button_submit.disabled = false;
  button_clear.disabled = true;
  button_read.disabled = true;
  ctx.fillStyle = "black";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  var dims = getDimensions(canvas.width,canvas.height,img.width,img.height);
  ctx.drawImage(img, dims["startX"], dims["startY"], dims["width"], dims["height"]);

  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

input.addEventListener('change', () => {
  const image = URL.createObjectURL(input.files[0])
  img.src = image;
  let coords
  img.alt = input.files[0].name;
});

form.addEventListener('submit', (event) => {
  console.log(text_top.value,text_bottom.value);
  button_submit.disabled = true;
  button_clear.disabled = false;
  button_read.disabled = false;
  ctx.textAlign = "center";
  ctx.font = "60px Impact";
  ctx.fillStyle = "white";
  ctx.lineWidth="2"
  ctx.fillText(text_top.value, canvas.width/2, 50);
  ctx.fillText(text_bottom.value, canvas.width/2, canvas.height-8);
  ctx.strokeText(text_top.value, canvas.width/2, 50);
  ctx.strokeText(text_bottom.value, canvas.width/2, canvas.height-8);
  
  event.preventDefault();
});

button_clear.addEventListener('click', () => {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  button_submit.disabled = false;
  button_clear.disabled = true;
  button_read.disabled = true;
});

button_read.addEventListener('click', () => {
  var utterThis = new SpeechSynthesisUtterance(text_top.value + text_bottom.value);
  var selectedOption = voice_selection.selectedOptions[0].getAttribute('data-name');
  for(var i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      utterThis.voice = voices[i];
    }
  }
  utterThis.volume = volume_slider.value / 100.0;
  synth.speak(utterThis);

});

volume_slider.addEventListener('input', () => {
  if( volume_slider.value >= 67) {
    volume_icon.src = "icons/volume-level-3.svg"
    volume_icon.alt = "Volume Level 3"
  } else if (volume_slider.value >= 34) {
    volume_icon.src = "icons/volume-level-2.svg"
    volume_icon.alt = "Volume Level 2"
  } else if (volume_slider.value >= 1){
    volume_icon.src = "icons/volume-level-1.svg"
    volume_icon.alt = "Volume Level 1"
  } else {// val is 0
    volume_icon.src = "icons/volume-level-0.svg"
    volume_icon.alt = "Volume Level 0"
  }
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
