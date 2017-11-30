import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import compose from 'lodash/fp/compose';
import mapValues from 'lodash/fp/mapValues';
import Pagination from '@beqom/alto-ui/Pagination';

import * as actions from './actions';
import { formatRows } from '../../libs/helpers';
import Types from '../../Types';
import Table from '../Table';

import './DataGrid.scss';

class DataGridContainer extends Component {
  constructor(props) {
    super(props);

    props.initStore();

    this.fetchData();

    this.handleChangeCell = this.handleChangeCell.bind(this);
    this.handleChangeSelectAllRows = this.handleChangeSelectAllRows.bind(this);
    this.handleChangeSelectRow = this.handleChangeSelectRow.bind(this);
    this.handleSort = this.handleSort.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this);
  }

  getDataFetchingSetting() {
    const { store } = this.props;
    if (!store) return {};

    return store.get('settings').toJS();
  }

  fetchData(newSettings = {}) {
    const allSettings = Object.assign({}, this.getDataFetchingSetting(), newSettings);

    this.props.fetchData(allSettings)
      .then(({ groups, columns, rows, settings }) => ({
        groups: Immutable.fromJS(groups),
        columns: Immutable.fromJS(columns),
        rows: Immutable.fromJS(rows),
        settings,
      }))
      .then(({ groups, columns, rows, settings }) => {
        this.props.setGroups(groups);
        this.props.setColumns(columns);
        this.props.setSettings(settings);
        this.props.setRows(rows.slice(0, 10));
        this.props.setDisplayableRows(formatRows(rows, columns));
      });
  }

  handleChangeCell(columnKey, rowKey, value) {
    const rows = this.props.store.get('rows');
    const columns = this.props.store.get('columns');
    const column = columns.find(c => c.get('key') === columnKey);
    const parser = column.get('parser');
    const parsedValue = parser(value);
    const rowIndex = rows.findIndex(r => r.get(this.props.rowKey) === rowKey);

    const promise = this.props.onChangeCell({
      rows: rows.toJS(),
      rowIndex,
      row: rows.get(rowIndex),
      value: parsedValue,
      key: columnKey,
      columns: columns.toJS(),
      column: column.toJS(),
    });

    if (promise && promise.then) {
      promise
        .then(newRows => Immutable.fromJS(newRows))
        .then(newRows => {
          this.props.setRows(newRows);
          this.props.setDisplayableRows(formatRows(newRows, columns));
        });
    } else {
      const displayableRows = this.props.store.get('displayableRows');
      const formatter = column.get('formatter');
      const formattedValue = formatter(parsedValue);
      this.props.setRows(rows.setIn([rowIndex, columnKey], parsedValue));
      this.props.setDisplayableRows(displayableRows.setIn([rowIndex, columnKey], formattedValue));
    }
  }

  handleSort(columnKey, newWay) {
    const currentColumnKey = this.props.store.getIn(['settings', 'sort', 'columnKey']);
    const currentWay = this.props.store.getIn(['settings', 'sort', 'way']);
    // reset
    if (currentColumnKey === columnKey && currentWay === -1) {
      return this.fetchData({ sort: null });
    }

    const way = newWay || currentColumnKey === columnKey ? currentWay * -1 : 1;

    return this.fetchData({ sort: { columnKey, way } });
  }

  handleChangePage(current) {
    const rowsPerPage = this.props.store.getIn(['settings', 'pagination', 'rowsPerPage']);
    const max = this.props.store.getIn(['settings', 'pagination', 'max']);
    return this.fetchData({ pagination: { rowsPerPage, current, max } });
  }

  handleChangeSelectAllRows() {}

  handleChangeSelectRow() {}

  render() {
    const { store, rowKey } = this.props;
    if (!store) return null;

    const currentPage = store.getIn(['settings', 'pagination', 'current']);
    const maxPages = store.getIn(['settings', 'pagination', 'max']);

    return (
      <div>
        <Table
          rowKey={rowKey}
          groups={store.get('groups')}
          columns={store.get('columns')}
          visibleColumns={store.get('visibleColumns')}
          rows={store.get('displayableRows')}
          headerRowsCount={store.get('headerRowsCount')}
          onChangeCell={this.handleChangeCell}
          onChangeSelectAllRows={this.handleChangeSelectAllRows}
          onChangeSelectRow={this.handleChangeSelectRow}
          onSort={this.handleSort}
          sort={store.getIn(['settings', 'sort'])}
        />
        <footer className="DataGrid__footer">
          <div />
          {(currentPage && maxPages) && (
            <Pagination
              max={maxPages}
              current={currentPage}
              onClick={this.handleChangePage}
            />
          )}
        </footer>
      </div>
    );
  }
}

DataGridContainer.displayName = 'DataGridContainer';

DataGridContainer.propTypes = {
  // tableId & reducerName are used in redux
  // eslint-disable-next-line react/no-unused-prop-types
  tableId: PropTypes.string.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  reducerName: PropTypes.string.isRequired,
  rowKey: PropTypes.string.isRequired,
  fetchData: PropTypes.func.isRequired,
  onChangeCell: PropTypes.func.isRequired,
  // actions
  initStore: PropTypes.func.isRequired,
  setGroups: PropTypes.func.isRequired,
  setColumns: PropTypes.func.isRequired,
  setRows: PropTypes.func.isRequired,
  setDisplayableRows: PropTypes.func.isRequired,
  setSettings: PropTypes.func.isRequired,
};

const mapStateToProps = (state, props) => {
  const { tableId, reducerName } = props;
  return {
    store: state[reducerName].get(tableId),
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const { tableId } = props;
  return mapValues(fn => compose(dispatch, fn(tableId)), actions);
};

export default connect(mapStateToProps, mapDispatchToProps)(DataGridContainer);
