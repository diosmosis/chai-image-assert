import React, { Component } from 'react';
import './App.css';

/*
TODO:
  - create frontend
  - hook up frontend
  - test manually
  - visual regression test that acts as system test
*/

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="row">
          <nav>
            <div className="nav-wrapper">
              <div className="col s12">
                <a href="#" className="brand-logo">chai-image-assert</a>
              </div>
            </div>
          </nav>
        </div>

        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
