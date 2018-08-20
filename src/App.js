import React, {Component} from 'react';
import { Creatable } from 'react-select';
import Automerge from 'automerge';


function shrinkId(id) {
  if (id.length <= 12) return id;
  let front = id.substring(0, 6);
  let end = id.substring(id.length - 6);
  return `${front}...${end}`;
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      doc: this.props.hm.docs[this.props.docId],
      name: '',
      peers: [],
      docs: [],
      peerIds: {},
      lastDiffs: [],
      tiles: []
    };
    this.handleClick = this.handleClick.bind(this);
    this.onRef = ref => this.tile = ref;
  }

  componentDidMount() {

    console.log('initialing mosaic')
      let mosaicSize = 392;
      for (var i = mosaicSize - 1; i >= 0; i--) {
        this.state.tiles.push(false);
    }   

    console.log('selecting document with docId', this.props.docId)
    this.selectDocument(this.props.docId);


    // ----------------------- handle peer actions -----------------------

    this.props.hm.on('peer:message', (actorId, peer, msg) => {
      // keep track of peer ids
      if (msg.type === 'hi') {
        console.log('the new peer says hi')
        let peerIds = this.state.peerIds;
        let id = peer.remoteId.toString('hex');
        peerIds[id] = msg.id;
      }
    });

    this.props.hm.on('peer:joined', (actorId, peer) => {
      // tell new peers this peer's id
      this.props.hm._messagePeer(peer, {type: 'hi', id: this.props.id});
      this.setState({ peers: this.uniquePeers(this.state.doc) });
      console.log('peers in doc: ', this.state.peers.length)
    });

    // this.props.hm.on('peer:left', (actorId, peer) => {
    //   if (this.state.doc && peer.remoteId) {
    //     // remove the leaving peer from the editor
    //     let id = peer.remoteId.toString('hex');
    //     id = this.state.peerIds[id];
    //     let changedDoc = this.props.hm.change(this.state.doc, (changeDoc) => {
    //       delete changeDoc.peers[id];
    //       console.log('a peer left')
    //     });
    //     this.setState({ doc: changedDoc, peers: this.uniquePeers(this.state.doc) });
    //   }
    // });

    // remove self when closing window
    window.onbeforeunload = () => {
      let changedDoc = this.props.hm.change(this.state.doc, (changeDoc) => {
        delete changeDoc.peers[this.props.id];
      });
      console.log('I left the doc')
    }

  }

  uniquePeers(doc) {
    // count unique peers on document
    if (doc) {
      let peers = this.props.hm.feeds[this.props.hm.getId(doc)].peers;
      return [...new Set(peers.filter((p) => p.remoteId).map(p => p.remoteId.toString('hex')))];
    }
    return [];
  }

  listenForDocument() {
    this.props.hm.once('document:ready', (docId, doc, prevDoc) => {
      console.log('listening for document')
      this.setState({ peers: this.uniquePeers(doc) });
    });
  }

  selectDocument(selected) {
    let docId = selected.value;
    console.log('selected doc')
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

  handleClick(e, tile) {
    e.preventDefault();

    //update clicked tile to true
    let updatingTiles = this.state.tiles;
    updatingTiles[tile] = true;
    this.setState({tiles: updatingTiles});
    console.log('updated tile');

    this.loadFile(e);
  }

  loadFile(e) {
    let file = e.target.files[0];
    console.log(file.path, 'ok now what? ');
  }

  render() {
    let main;
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
            {this.state.tiles.map( (d,i) => 
              <div className={ !this.state.tiles[i] ? "tile" : "tile-clicked"} key={i}>
                <input type="file" ref={this.onRef} onChange={e => this.handleClick(e,i)}/>
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
