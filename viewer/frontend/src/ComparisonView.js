import React from 'react';
import PropTypes from 'prop-types';

export default function ComparisonView({ comparisonId, onCopyFile }) {
  return <div className="ComparisonView">
    <ul className="tabs">
      <li className="tab col s3"><a href="#cv-side-by-side">Side By Side</a></li>
      <li className="tab col s3"><a href="#cv-diff">Diff</a></li>
      <li className="tab col s3"><a href="#cv-expected">Expected</a></li>
      <li className="tab col s3"><a href="#cv-processed">Processed</a></li>
    </ul>

    <div className="row"></div>
    <div className="row">
      <div className="col s6 left-align">
        <a
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
          className="waves-effect waves-light btn"
          onClick={(e) => {
            e.preventDefault();
            onCopyFile(comparisonId, 'to-processed');
          }}
        >
          Copy to processed
          <i className="material-icons left">chevron_right</i>
        </a>
      </div>
    </div>
    <div className="row"></div>

    <div id="cv-side-by-side" className="row">
      <div className="col s6">
        <h5 className="center-align">Processed</h5>

        <img
          alt={`processed file ${comparisonId}.png`}
          src={`/files/processed/${comparisonId}.png`}
        />
      </div>
      <div className="col s6">
        <h5 className="center-align">Expected</h5>

        <img
          alt={`expected file ${comparisonId}.png`}
          src={`/files/expected/${comparisonId}.png`}
        />
      </div>
    </div>

    <div id="cv-diff" className="row">
      <div className="col s12">
        <img
          alt={`diff file ${comparisonId}.diff.png`}
          src={`/files/processed/${comparisonId}.diff.png`}
        />
      </div>
    </div>

    <div id="cv-expected" className="row">
      <div className="col s12">
        <img
          alt={`expected file ${comparisonId}.png`}
          src={`/files/expected/${comparisonId}.png`}
        />
      </div>
    </div>

    <div id="cv-processed" className="row">
      <div className="col s12">
        <img
          alt={`processed file ${comparisonId}.png`}
          src={`/files/processed/${comparisonId}.png`}
        />
      </div>
    </div>
  </div>;
}

ComparisonView.PropTypes = {
  comparisonId: PropTypes.string.required,
  onCopyFile: PropTypes.func,
};

ComparisonView.defaultProps = {
  onCopyFile: () => null,
};
