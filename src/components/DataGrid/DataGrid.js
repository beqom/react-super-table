import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

import './DataGrid.scss';

const DataGrid = ({ className, children }) => (
  <div className={classnames('DataGrid', className)}>
    {children}
  </div>
);


DataGrid.displayName = 'DataGrid';

DataGrid.defaultProps = {
};

DataGrid.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any,
};

export default DataGrid;
