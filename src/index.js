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
  console.log(`My ID: ${id}`);

  let main = document.getElementById('main');
  render(<App hm={hm} id={id}/>, main);
});
