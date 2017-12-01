import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import range from 'lodash/range';
import ImmutablePropTypes from 'react-immutable-proptypes';

import Types from '../../../../Types';
import './TableHeader.scss';

const CaretUp = ({ size = 8 }) => (
  <svg width={size} height={size} viewBox="0 0 8 8">
    <path fill="currentColor" d="M4,2 l4,5 h-8 z" />
  </svg>
);

const CaretDown = ({ size = 8 }) => (
  <svg width={size} height={size} viewBox="0 0 8 8">
    <path fill="currentColor" d="M4,6 l4,-5 h-8 z" />
  </svg>
);

const getAriaSortProps = (isColumnSorted, sort) => {
  if (!sort || !isColumnSorted) return {};
  return {
    'aria-sort': sort.get('way') === 1 ? 'ascending' : 'descending',
  };
};

class TableHeader extends React.Component {
  shouldComponentUpdate(nextProps) {
    if (this.props.sort !== nextProps.sort) return true;
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
              group
                .set(
                  'columnsCount',
                  (group.get('columnsCount') || 0) + (column.get('columnsCount') || 1)
                )
                .set('isGroup', true)
            );
          }
        }

        // return acc.push(column.set('group', null));
        const group = acc.last();
        const columnsCount = column.get('columnsCount') || 1;
        if (group && group.get('empty')) {
          return acc.setIn(
            [acc.size - 1, 'columnsCount'],
            group.get('columnsCount') + columnsCount
          );
        }
        return acc.push(
          Immutable.Map({
            isGroup: true,
            empty: true,
            key: `group-${column.get('key')}`,
            name: '',
            columnsCount,
          })
        );
      }, Immutable.List());
      // return this.getHeaders(groups).push(columnsWithGroup);
      return this.getHeaders(groups).push(columns);
    }

    return Immutable.List([columns]);
  }

  renderSelectAllRows(isFirstRow, isLastRow) {
    if (!this.props.onChangeSelectAllRows) return null;

    if (isFirstRow && !isLastRow) {
      return <th className="TableHeader__cell" rowSpan={this.props.headerRowsCount - 1} />;
    }

    if (isLastRow) {
      return (
        <th className="TableHeader__cell">
          <div className="TableHeader__cell-content TableHeader__cell-content--select">
            <input type="checkbox" onChange={this.props.onChangeSelectAllRows} />
          </div>
        </th>
      );
    }

    return null;
  }

  renderHeaderRow(columns, rowIndex, rowsCount) {
    const { sort } = this.props;
    const headers = columns.map(column => {
      const columnsCount = column.get('columnsCount');
      const style = column.getIn(['layout', 'flex'])
        ? { minWidth: column.getIn(['layout', 'minWidth']) || 20 }
        : { width: column.getIn(['layout', 'width']) };
      const columnKey = column.get('key');
      const isColumnSorted = sort && sort.get('columnKey') === columnKey;
      return (
        <th
          key={columnKey}
          className={classnames('TableHeader__cell', {
            'TableHeader__cell--empty-group': column.get('isGroup') && column.get('empty'),
          })}
          colSpan={columnsCount || 0}
          rowSpan={columnsCount ? 0 : rowsCount - rowIndex}
          scope={columnsCount ? 'colgroup' : 'col'}
          {...getAriaSortProps(isColumnSorted, sort)}
          style={style}
        >
          {column.get('isGroup') || !this.props.onSort ? (
            <div className="TableHeader__cell-content" style={style}>
              {column.get('title')}
            </div>
          ) : (
            <button
              className="TableHeader__cell-content TableHeader__cell-content--sortable"
              style={style}
              onClick={() => this.props.onSort(columnKey)}
            >
              <div className="TableHeader__cell-value">{column.get('title')}</div>
              <div className="TableHeader__cell-sort-buttons">
                <div
                  className={classnames('TableHeader__sort', {
                    'TableHeader__sort--active': isColumnSorted && sort.get('way') === 1,
                  })}
                >
                  <CaretUp />
                </div>
                <div
                  className={classnames('TableHeader__sort', {
                    'TableHeader__sort--active': isColumnSorted && sort.get('way') === -1,
                  })}
                >
                  <CaretDown />
                </div>
              </div>
            </button>
          )}
        </th>
      );
    });

    return (
      <tr key={rowIndex} className="TableHeader__row">
        {this.renderSelectAllRows(rowIndex === 0, rowIndex === rowsCount - 1)}
        {headers}
      </tr>
    );
  }

  render() {
    const { columns, className, headerRowsCount } = this.props;

    const headers = this.getHeaders(columns);
    const headerRows = headers.map((header, index) =>
      this.renderHeaderRow(header, index, headerRowsCount)
    );

    return <thead className={classnames('TableHeader', className)}>{headerRows}</thead>;
  }
}

TableHeader.displayName = 'TableHeader';

TableHeader.defaultProps = {};

TableHeader.propTypes = {
  groups: ImmutablePropTypes.listOf(Types.immutableGroup).isRequired,
  columns: ImmutablePropTypes.contains(Types.columnKeys).isRequired,
  className: PropTypes.string,
  headerRowsCount: PropTypes.number.isRequired,
  onChangeSelectAllRows: PropTypes.func,
  onSort: PropTypes.func,
};

export default TableHeader;
