import React, { Component } from 'react';
import { FormGroup, FormControl, InputGroup, Glyphicon } from 'react-bootstrap';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: ''
    };
  }
  HandleChange = (e) => {
    this.setState({
      query: e.target.value
    });
  };
  Search = () => {
    console.log('this.state', this.state);
    const BASE_URL= 'https://api.spotify.com/v1/search';
    const FETCH_URL = BASE_URL + '?q=' + this.state.query + '&type=artist&limit=1';
    console.log(FETCH_URL);
  };
  Entered = (e) => {
    e.key === "Enter" ? this.Search() : null;
  };
  render() {
    return (
      <div className="App">
        <div className="App-title">
          <h1>Spotify Music Artists</h1>
        </div>
        <FormGroup>
          <InputGroup>
            <FormControl type="text"
             placeholder="Serach for an Artist"
             value={this.state.query}
             onChange={(e) => this.HandleChange(e)}
             onKeyPress={(e) => this.Entered(e)} />
            <InputGroup.Addon onClick={() => this.Search()}>
              <Glyphicon glyph="search"></Glyphicon>
            </InputGroup.Addon>
          </InputGroup>
        </FormGroup>
        <div className="Profile">
            <div>Artist Picture</div>
            <div>Artist Name</div>
        </div>
        <div className="Gallery">
          Gallery
        </div>
      </div>
    );
  }
}

export default App;
