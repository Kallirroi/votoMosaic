import App from './App';
import React from 'react';
import Hypermerge from 'hypermerge';
import {render} from 'react-dom';

const path = 'docs';

const hm = new Hypermerge({
  path: path
});

hm.once('ready', (hm) => {
  hm.joinSwarm({utp: false}); // getting an error with utp?

  let id = hm.swarm.id.toString('hex');
  console.log(`My peer id is: ${id}`);

  // hm.create();
  let docsIds = Object.keys(hm.docs).map((docId) => {
    	return docId;
  	});

  let docId = docsIds ? docsIds[0] : null;
  console.log('this docId is ', docId);

  let main = document.getElementById('main');
  render(<App hm={hm} id={id} docId={docId} />, main);
});
