import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import range from 'lodash/range';
import ImmutablePropTypes from 'react-immutable-proptypes';

import Types from '../../Types';
import './TableHeader.scss';


class TableHeader extends React.Component {
  shouldComponentUpdate(nextProps) {
    if (this.props.columns !== nextProps.columns) return true;
    return false;
  }

  getHeaders(columns) {
    const columnsWithGroup = columns.filter(column => !!column.get('group'));
    if (columnsWithGroup.size) {
      const groups = columns.reduce((acc, column) => {
        const groupKey = column.get('group');
        if (groupKey) {
          const groupIndex = acc.findIndex(g => g.get('key') === groupKey);
          const group =
            groupIndex > -1
              ? acc.get(groupIndex)
              : this.props.groups.find(g => g.get('key') === groupKey);

          if (group) {
            return acc.set(
              groupIndex === -1 ? acc.size : groupIndex,
              group.set(
                'columnsCount',
                (group.get('columnsCount') || 0) + (column.get('columnsCount') || 1)
              )
            );
          }
        }
        return acc.push(column.set('group', null));
      }, Immutable.List());
      return this.getHeaders(groups).push(columnsWithGroup);
    }

    return Immutable.List([columns]);
  }

  renderSelectAllRows(rowIndex) {
    if (rowIndex !== 0) return null;

    return (
      <th className="TableHeader__cell" rowSpan={this.props.headerRowsCount}>
        <div className="TableHeader__cell-content TableHeader__cell-content--select">
          <input type="checkbox" onChange={this.props.onChangeSelectAllRows} />
        </div>
      </th>
    );
  }

  renderHeaderRow(columns, rowIndex, rowsCount) {
    const headers = columns.map(column => {
      const columnsCount = column.get('columnsCount');
      const layout = column.get('layout');
      const style = layout ? { width: layout.get('width') } : {};
      return (
        <th
          key={column.get('key')}
          className="TableHeader__cell"
          colSpan={columnsCount || 0}
          rowSpan={columnsCount ? 0 : rowsCount - rowIndex}
          scope={columnsCount ? 'colgroup' : 'col'}
        >
          <div className="TableHeader__cell-content" style={style}>{column.get('title')}</div>
        </th>
      );
    });

    return (
      <tr key={rowIndex} className="TableHeader__row">
        {this.renderSelectAllRows(rowIndex)}
        {headers}
      </tr>
    );
  }

  render() {
    const { columns, className, headerRowsCount } = this.props;

    const headers = this.getHeaders(columns);
    const headerRows = headers.map((header, index) =>
      this.renderHeaderRow(header, index, headerRowsCount));

    const headerRowsCountDeltaRows = range(headerRowsCount - headers.size).map(i =>
      this.renderHeaderRow([], headers.size + i));


    return (
      <thead className={classnames('TableHeader__thead', className)}>
        {headerRows}
        {headerRowsCountDeltaRows}
      </thead>
    );
  }
}

TableHeader.displayName = 'TableHeader';

TableHeader.defaultProps = {};

TableHeader.propTypes = {
  groups: ImmutablePropTypes.listOf(Types.immutableGroup).isRequired,
  columns: ImmutablePropTypes.contains(Types.columnKeys).isRequired,
  className: PropTypes.string,
  headerRowsCount: PropTypes.number.isRequired,
  onChangeSelectAllRows: PropTypes.func.isRequired,
};

export default TableHeader;
