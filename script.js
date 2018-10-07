import {$} from 'https://pauls-uikit.hashbase.io/js/dom.js'
import {renderCanvas} from './canvas.js'

var pathToImage = "exported.png";
// var pathToImage = "output/Eggleston.jpeg";

renderCanvas(pathToImage);

$('#add-photo').addEventListener('change', function(e) {
  e.preventDefault();
  console.log('change!');
});
