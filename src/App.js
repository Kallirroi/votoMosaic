import React, {Component} from 'react';
import Automerge from 'automerge';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      doc: null,
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

  componentDidMount() {
    
    //create doc - do this only once!
    // this.props.hm.create();
    // console.log('opening doc with id', this.props.id)
    // this.props.hm.open(this.props.id);

    //initialize mosaic
    let mosaicSize = 392;
    for (var i = mosaicSize - 1; i >= 0; i--) {
      this.state.tiles.push(false);
    }

    // this.props.hm.on('peer:message', (actorId, peer, msg) => {
    //   // keep track of peer ids
    //   if (msg.type === 'hi') {
    //     let peerIds = this.state.peerIds;
    //     let id = peer.remoteId.toString('hex');
    //     peerIds[id] = msg.id;
    //   }
    // });

    this.props.hm.on('peer:joined', (actorId, peer) => {
      // tell new peers this peer's id
      this.props.hm._messagePeer(peer, {type: 'hi', id: this.props.id});
      this.setState({ peers: this.uniquePeers(this.state.doc) });
    });

    // this.props.hm.on('peer:left', (actorId, peer) => {
    //   if (this.state.doc && peer.remoteId) {
    //     // remove the leaving peer from the editor
    //     let id = peer.remoteId.toString('hex');
    //     id = this.state.peerIds[id];
    //     let changedDoc = this.props.hm.change(this.state.doc, (changeDoc) => {
    //       delete changeDoc.peers[id];
    //     });
    //     this.setState({ doc: changedDoc, peers: this.uniquePeers(this.state.doc) });
    //   }
    // });

    // // remove self when closing window
    // window.onbeforeunload = () => {
    //   let changedDoc = this.props.hm.change(this.state.doc, (changeDoc) => {
    //     delete changeDoc.peers[this.props.id];
    //   });
    // }

    // this.props.hm.on('document:updated', (docId, doc, prevDoc) => {
    //   if (this.state.doc && this.props.hm.getId(this.state.doc) == docId) {
    //     let diff = Automerge.diff(prevDoc, doc);
    //     let lastDiffs = diff.filter((d) => d.type === 'text');
    //     this.setState({ doc, lastDiffs });
    //     this.updateDocsList();
    //   }
    // });

    this.props.hm.on('document:ready', (docId, doc, prevDoc) => {
      this.updateDocsList();
    });
  }

  updateDocsList() {
    let docs = Object.keys(this.props.hm.docs).map((docId) => {
      return { value: docId, label: this.props.hm.docs[docId].title };
    }).filter((d) => d.label);
    this.setState({ docs });
  }

  uniquePeers(doc) {
    // count unique peers on document
    if (doc) {
      let peers = this.props.hm.feeds[this.props.hm.getId(doc)].peers;
      return [...new Set(peers.filter((p) => p.remoteId).map(p => p.remoteId.toString('hex')))];
    }
    return [];
  }

  render() {
    let main = (
      <div id="votePlace">
        <h1 className="title">votePlace</h1>
        <hr/>
        <div className="text">
          <li>Choose a tile in the mosaic</li>
          <li>Click to upload your photo</li>
          <li>Keep this app running for your photo to always show up!</li>
        </div>
        <div id="tile-container">
          {this.state.tiles.map( (d,i) => 
            <div className={ !this.state.tiles[i] ? "tile" : "tile-clicked"} key={i}>
              <input type="file" ref={this.onRef} onChange={e => this.handleClick(e, i)}/>
            </div>
            )}
        </div>
      </div>
    );

    return <main role='main'>
      {main}
    </main>
  }
}

export default App;
