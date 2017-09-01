import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class ComparisonView extends Component {
  componentDidMount() {
    const $ = window.jQuery;
    $('ul.tabs').tabs();
  }

  render() {
    const comparisonId = this.props.comparisonId;
    const onCopyFile = this.props.onCopyFile;

    return <div className="ComparisonView">
      <div className="row">
        <div className="col s6 left-align">
          <a
            id="copy-to-expected"
            className="waves-effect waves-light btn"
            onClick={(e) => {
              e.preventDefault();
              onCopyFile(comparisonId, 'to-expected');
            }}
          >
            <i className="material-icons left">chevron_left</i>
            Copy to expected
          </a>
        </div>

        <div className="col s6 right-align">
          <a
            id="copy-to-processed"
            className="waves-effect waves-light btn"
            onClick={(e) => {
              e.preventDefault();
              onCopyFile(comparisonId, 'to-processed');
            }}
          >
            Copy to processed
            <i className="material-icons right">chevron_right</i>
          </a>
        </div>
      </div>
      <div className="row"></div>

      <div className="row">
        <ul className="tabs">
          <li className="tab col s3"><a id='cv-side-by-side-toggle' href="#cv-side-by-side">Side By Side</a></li>
          <li className="tab col s3"><a id='cv-diff-toggle' href="#cv-diff">Diff</a></li>
          <li className="tab col s3"><a id='cv-expected-toggle' href="#cv-expected">Expected</a></li>
          <li className="tab col s3"><a id='cv-processed-toggle' href="#cv-processed">Processed</a></li>
        </ul>
      </div>

      <div className="row"></div>

      <div
        id="cv-side-by-side"
        className="row"
      >
        <div className="col s6 center-align">
          <h5>Expected</h5>

          <img
            alt={`expected file ${comparisonId}.png`}
            src={`/files/expected/${comparisonId}.png`}
          />
        </div>
        <div className="col s6 center-align">
          <h5>Processed</h5>

          <img
            alt={`processed file ${comparisonId}.png`}
            src={`/files/processed/${comparisonId}.png`}
          />
        </div>
      </div>

      <div
        id="cv-diff"
        className="row"
      >
        <div className="col s12 center-align">
          <img
            alt={`diff file ${comparisonId}.diff.png`}
            src={`/files/processed/${comparisonId}.diff.png`}
          />
        </div>
      </div>

      <div
        id="cv-expected"
        className="row"
      >
        <div className="col s12 center-align">
          <img
            alt={`expected file ${comparisonId}.png`}
            src={`/files/expected/${comparisonId}.png`}
          />
        </div>
      </div>

      <div
        id="cv-processed"
        className="row"
      >
        <div className="col s12 center-align">
          <img
            alt={`processed file ${comparisonId}.png`}
            src={`/files/processed/${comparisonId}.png`}
          />
        </div>
      </div>
    </div>;
  }
}

ComparisonView.PropTypes = {
  comparisonId: PropTypes.string.required,
  onCopyFile: PropTypes.func,
};

ComparisonView.defaultProps = {
  onCopyFile: () => null,
};
