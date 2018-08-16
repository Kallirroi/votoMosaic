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
    

    //initialize mosaic
    let mosaicSize = 392;
    for (var i = mosaicSize - 1; i >= 0; i--) {
      this.state.tiles.push(false);
    }

    this.props.hm.on('peer:message', (actorId, peer, msg) => {
      // keep track of peer ids
      if (msg.type === 'hi') {
        let peerIds = this.state.peerIds;
        let id = peer.remoteId.toString('hex');
        peerIds[id] = msg.id;
      }
    });

    this.props.hm.on('peer:joined', (actorId, peer) => {
      // tell new peers this peer's id
      this.props.hm._messagePeer(peer, {type: 'hi', id: this.props.id});
      this.setState({ peers: this.uniquePeers(this.state.doc) });
      console.log('peer joined')
    });

    this.props.hm.on('peer:left', (actorId, peer) => {
      if (this.state.doc && peer.remoteId) {
        // remove the leaving peer from the editor
        let id = peer.remoteId.toString('hex');
        id = this.state.peerIds[id];
        let changedDoc = this.props.hm.change(this.state.doc, (changeDoc) => {
          delete changeDoc.peers[id];
        });
        this.setState({ doc: changedDoc, peers: this.uniquePeers(this.state.doc) });
        console.log('peer left')
      }
    });

    // remove self when closing window
    window.onbeforeunload = () => {
      let changedDoc = this.props.hm.change(this.state.doc, (changeDoc) => {
        delete changeDoc.peers[this.props.id];
      });
    }

    this.props.hm.on('document:updated', (docId, doc, prevDoc) => {
      if (this.state.doc && this.props.hm.getId(this.state.doc) == docId) {
        let diff = Automerge.diff(prevDoc, doc);
        let lastDiffs = diff.filter((d) => d.type === 'text');
        this.setState({ doc, lastDiffs });
        this.updateDocsList();
      }
    });

    this.props.hm.on('document:ready', (docId, doc, prevDoc) => {
      this.updateDocsList();
    });
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
      let changedDoc = this.props.hm.change(doc, (changeDoc) => {
        if (!changeDoc.text) {
          changeDoc.text = new Automerge.Text();
          changeDoc.title = 'Untitled';
          changeDoc.peers = {};
        }
        changeDoc.peers[this.props.id] = {
          name: this.state.name
        };
      });
      this.setState({ doc: changedDoc, peers: this.uniquePeers(doc) });
    });
  }

  createNewDocument() {
    this.props.hm.create();
    this.listenForDocument();
  }

  selectDocument(selected) {
    let docId = selected.value;
    this.openDocument(docId);
  }

  openDocument(docId) {
    try {
      if (this.props.hm.has(docId)) {
        let doc = this.props.hm.find(docId);
        doc = this.props.hm.change(doc, (changeDoc) => {
          changeDoc.peers[this.props.id] = {
            name: this.state.name
          };
        });
        this.setState({ doc: doc, peers: this.uniquePeers(doc) });
      } else {
        this.props.hm.open(docId);
        this.listenForDocument();
      }
    } catch(e) {
      console.log(e);
    }
  }

  updateDocsList() {
    let docs = Object.keys(this.props.hm.docs).map((docId) => {
      return { value: docId, label: this.props.hm.docs[docId].title };
    }).filter((d) => d.label);
    this.setState({ docs });
    console.log('updated document')
  }

  render() {
    let main;
    if (this.state.doc) {
      main = (
        <div> 
          <h1 className="title">votePlace</h1>
          <hr/>
          <div id="tile-container">
            {this.state.tiles.map( (d,i) => 
              <div className={ !this.state.tiles[i] ? "tile" : "tile-clicked"} key={i}>
                <input type="file" ref={this.onRef} onChange={e => this.handleClick(e, i)}/>
              </div>
              )}
          </div>
          <div className='doc-id'>Copy to share: <span>{this.props.hm.getId(this.state.doc)}</span></div>
        </div>
      );
    } else {
      main = (
        <div>
          <h1 className="title">votePlace</h1>
          <button onClick={this.createNewDocument.bind(this)}>Create new mosaic</button>
          <Creatable
            style={{width: '12em'}}
            placeholder='if you have the id, paste it here to join an existing doc'
            onChange={this.selectDocument.bind(this)}
            options={this.state.docs}
            promptTextCreator={(label) => `Open '${shrinkId(label)}'`}
          />
          <br/>
          <br/>
          or if you don't have the id, here's a list of the docs you have created
          <ul id='doc-list'>
            {this.state.docs.map((d) => {
              return <li key={d.value}><a onClick={() => this.openDocument(d.value)}>{d.label}</a></li>;
            })}
          </ul>
        </div>
      );
    }

    return <main role='main'>
      {main}
    </main>
  }
}

export default App;
