## votePlace


#### simplest demo

main idea: treat the mosaic as a p2p collaborative doc. 

<strong>Details</strong>

* app is launched by one peer, and a hypermerge instance is created
* a network swarm is created (`this.props.id`)
* a shared doc holding the mosaic is created under docs/feeds/ (`this.props.hm.docs[docId]`)
* another peer gets the docid (`this.props.hm.getId(this.state.doc)`) , runs the app uses the `docId` to join the shared doc (how can this be automatic?)
* a peer clicks on a tile, updating the state of their doc
the updates need to be synced to the other instance (`this.props.hm.on('document:updated', ....)`)