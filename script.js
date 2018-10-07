import {$} from 'https://pauls-uikit.hashbase.io/js/dom.js'
import {renderCanvas} from './canvas.js'

var pathToImage = "exported.png";
// var pathToImage = "output/Eggleston.jpeg";

renderCanvas(pathToImage);

$('#add-photo').addEventListener('change', function(e) {
  e.preventDefault();
  console.log('change!');
});

const form = document.forms['submit-to-google-sheet'],
    scriptURL = 'https://script.google.com/macros/s/AKfycbzMi5e-JvqNAQc78M06Iw1E2Gy1jzGl4A7OQXfRZuxpa01Vmxxa/exec'

form.addEventListener('submit', e => {
    e.preventDefault()
    fetch(scriptURL, { method: 'POST', origin: "*", body: new FormData(form)})
      .then(response => console.log('Success!', response))
      .catch(error => console.error('Error!', error.message))
})
