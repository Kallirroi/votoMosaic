import React, {Component} from 'react';
import { Creatable } from 'react-select';
import Automerge from 'automerge';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      doc: this.props.hm.docs[this.props.docId],
      peers: [],
      peerIds: {}
    };
    this.claimTile = this.claimTile.bind(this);
    this.onRef = ref => this.tile = ref;
  }

  componentDidMount() {

    this.initializeDocument();
    
    console.log('selecting document with docId', this.props.docId)
    this.selectDocument(this.props.docId);


    // ----------------------- handle peer actions -----------------------

    this.props.hm.on('peer:message', (actorId, peer, msg) => {
      // keep track of peer ids
      if (msg.type === 'hi') {
        let peerIds = this.state.peerIds;
        let id = peer.remoteId.toString('hex');
        peerIds[id] = msg.id;
        console.log('we were joined by', peerIds[id])
      }
    });

    // this.props.hm.on('peer:joined', (actorId, peer) => {
    //   // tell new peers this peer's id
    //   this.props.hm._messagePeer(peer, {type: 'hi', id: this.props.id});
    //   this.setState({ peers: this.uniquePeers(this.state.doc) });
    //   console.log('here is my list of peer remote ids in this session ',this.state.peers);
    // });

    // this.props.hm.on('peer:left', (actorId, peer) => {
    //   if (this.state.doc && peer.remoteId) {
    //     // remove the leaving peer 
    //     let id = peer.remoteId.toString('hex');
    //     id = this.state.peerIds[id];

    //     let newDoc = this.props.hm.change(this.state.doc, (changeDoc) => {
    //       delete changeDoc.peers[id];
    //     });
    //     this.setState({ doc: newDoc, peers: this.uniquePeers(this.state.doc) });
    //   }
    // });

    // remove self
    window.onbeforeunload = () => {
      console.log('removing myself')
      this.state.doc.leave(this.props.id);
    }

    this.props.hm.on('document:updated', (docId, doc, prevDoc) => {
      if (this.state.doc && this.props.hm.getId(this.state.doc) == docId) {
        this.setState({ doc});
      }
      console.log('updated document')
    });

  }

  initializeDocument() {
    let newDoc = this.props.hm.change(this.state.doc, (changeDoc) => {
      changeDoc.tiles = [];
      changeDoc.imagePaths = [];
      let mosaicSize = 392;
      for (var i = mosaicSize - 1; i >= 0; i--) {
        changeDoc.tiles.push(false);
        changeDoc.imagePaths.push('');
      }  
    });
    this.setState({ doc: newDoc });
    console.log('initialized mosaic')
  }

  selectDocument(selected) {
    let docId = selected.value;
    console.log('selected document')
    this.openDocument(docId);
  }

  openDocument(docId) {
    try {
      this.props.hm.open(docId);
      this.listenForDocument();
      console.log('opened doc');

    } catch(e) {
      console.log('something went wrong with opening the document', e);
    }
  }

  listenForDocument() {
    this.props.hm.once('document:ready', (docId, doc, prevDoc) => {
      this.setState({ peers: this.uniquePeers(doc) });
    });
    console.log('listened for document')
  }


  uniquePeers(doc) {
    // count unique peers on document
    if (doc) {
      let peers = this.props.hm.feeds[this.props.hm.getId(doc)].peers;
      return [...new Set(peers.filter((p) => p.remoteId).map(p => p.remoteId.toString('hex')))];
    }
    return [];
  }

  claimTile(e, tile) {
    e.preventDefault();
    try {
      let newDoc = this.props.hm.change(this.state.doc, (changeDoc) => {
        changeDoc.tiles[tile] = true;
      });
      this.setState({ doc: newDoc });
      console.log('you successfully claimed tile #', tile)

      this.loadFile(e, tile);
    }
    catch(e) {
      console.log(e);
    }
  }

  loadFile(e,tile) {
    try {
      let file = e.target.files[0];
      if (file) {
        let reader = new FileReader();
        reader.onload = () => {
          let newDoc = this.props.hm.change(this.state.doc, (changeDoc) => {
            changeDoc.imagePaths[tile] = reader.result;
          });
          this.setState({ doc: newDoc });

        };
        reader.readAsDataURL(file);
      }
    } catch(e) {
      console.log('something went wrong', e)
    }
  }

  render() {
    let main;
    let tiles = this.state.doc.tiles ? this.state.doc.tiles : [];
    let imagePaths = this.state.doc.imagePaths ? this.state.doc.imagePaths : [];
    if (this.state.doc) {
      main = (
        <div> 
          <h1 className="title">votePlace</h1>
          <hr/>
          <li>1. Click to select a tile</li>
          <li>2. Upload your photo</li>
          <li>3. Keep your app running to have your mosaic part show!</li>
          <hr/>
          <div id="tile-container">
            {tiles.map( (d,i) => 
              <div className={ !tiles[i] ? "tile" : "tile-clicked"} key={i} style={ tiles[i] ? { backgroundImage: 'url(' + imagePaths[i] + ')'}  : null}>
                <input type="file" disabled={tiles[i]} ref={this.onRef} onChange={e => this.claimTile(e,i)}/>
              </div>
              )}
          </div>
          <div className='doc-id'>Document id: <span>{this.props.hm.getId(this.state.doc)}</span></div>
          <div className='doc-id'>My swarm id: <span>{this.props.id}</span></div>
          
        </div>
      );
    } else {
      main = (
        <div>
          <h1 className="title">votePlace</h1>
          something went wrong....
        </div>
      );
    }

    return <main role='main'>
      {main}
    </main>
  }
}

export default App;
