import React from 'react';
import PropTypes from 'prop-types';

export default function ComparisonList({ comparisons, selectedComparison, onSelectComparison }) {
  return <div className="ComparisonList collection with-header">
    <div className="collection-header"><h4>Comparisons</h4></div>

    {comparisons.map(renderListEntry)}
  </div>;

  function renderListEntry(comp) {
    return <a
      className={'comparison-link collection-item' + (selectedComparison === comp ? ' active' : '')}
      href=""
      key={comp}
      onClick={(e) => {
        e.preventDefault();
        onSelectComparison(comp);
      }}
    >
      {comp}
    </a>;
  }
}

ComparisonList.propTypes = {
  comparisons: PropTypes.arrayOf(PropTypes.string),
  selectedComparison: PropTypes.string,
  onSelectComparison: PropTypes.func,
};

ComparisonList.defaultProps = {
  onSelectComparison: () => null,
};
