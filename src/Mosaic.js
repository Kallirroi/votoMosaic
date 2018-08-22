import Automerge from 'automerge';
import React, {Component} from 'react';


class Peer extends Component {
  render() {
    let peer = this.props.peer;
    return (
      <div>
        I am a {peer}
      </div>);
  }
}


class Mosaic extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }


  render() {
    let main = (
        <div>
          <Peer/>
        </div>);

    return <div>{main}</div>;
  }
}

export default Mosaic;