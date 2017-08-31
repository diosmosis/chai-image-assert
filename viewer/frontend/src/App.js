import React, { Component } from 'react';
import * as axios from 'axios';
import ComparisonList from './ComparisonsList';
import ComparisonView from './ComparisonView';
import './App.css';

const Materialize = window.Materialize;

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      comparisons: [],
      currentComparison: undefined,
    };

    this.onSelectComparison = this.onSelectComparison.bind(this);
    this.onCopyFile = this.onCopyFile.bind(this);
  }

  componentDidMount() {
    this.fetchComparisons();
  }

  async fetchComparisons() {
    let response;
    try {
      response = await axios.get('/comparisons');
    } catch (e) {
      Materialize.toast('Could not get the comparison list! Try starting the viewer again.',
        5000, 'error-toast');
      return;
    }

    this.setState({
      comparisons: response.data,
    });
  }

  onSelectComparison(compName) {
    this.setState({
      currentComparison: compName,
    });
  }

  async onCopyFile(name, direction) {
    try {
      await axios.post('/copy', {
        name,
        direction,
      });
    } catch (e) {
      Materialize.toast('Copying failed!', 3000, 'error-toast');
      return;
    }
  }

  render() {
    return (
      <div className="App">
        <div className="row">
          <nav>
            <div className="nav-wrapper">
              <div className="col s12">
                <a href="" className="brand-logo">chai-image-assert</a>
              </div>
            </div>
          </nav>
        </div>

        <div className="row"></div>

        <div className="row">
          <div className="col s3">
            <ComparisonList
              comparisons={this.state.comparisons}
              selectedComparison={this.state.currentComparison}
              onSelectComparison={this.onSelectComparison}
            />
          </div>

          <div className="col s9">
            {this.state.currentComparison ? (<ComparisonView
              comparisonId={this.state.currentComparison}
              onCopyFile={this.onCopyFile}
            />) : null}
          </div>
        </div>
      </div>
    );
  }
}
