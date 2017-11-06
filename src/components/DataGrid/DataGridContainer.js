import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import compose from 'lodash/fp/compose';
import Immutable from 'immutable';

import {
  initStore,
  setColumns,
  setRows,
  setGroups,
  setDisplayableRows,
  sort,
} from './actions';
import { formatRows } from '../../libs/helpers';
import Types from '../../Types';
import Table from '../Table';

class DataGridContainer extends Component {
  constructor(props) {
    super(props);

    props.initStore();
    this.fetchData();

    this.handleChangeCell = this.handleChangeCell.bind(this);
    this.handleChangeSelectAllRows = this.handleChangeSelectAllRows.bind(this);
    this.handleChangeSelectRow = this.handleChangeSelectRow.bind(this);
    this.handleSort = this.handleSort.bind(this);
  }

  componentDidUpdate(prevProps) {
    const nextSort = this.props.store && this.props.store.get('sort');
    const prevSort = prevProps.store && prevProps.store.get('sort');
    if (prevSort !== nextSort) {
      this.fetchData();
    }
  }

  getDataFetchingSetting() {
    const { store } = this.props;
    if (!store) return {};

    return {
      sort: store.get('sort').toJS(),
    }
  }

  fetchData() {
    const settings = this.getDataFetchingSetting();

    this.props.fetchData(settings)
      .then(({ groups, columns, rows }) => {
        this.props.setGroups(groups);
        this.props.setColumns(columns);
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
      rows,
      rowIndex,
      row: rows.get(rowIndex),
      value: parsedValue,
      key: columnKey,
      columns,
      column,
    });

    if( promise && promise.then ) {
      promise.then(newRows => {
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

  handleSort(columnKey) {
    this.props.sort(columnKey);
  }

  handleChangeSelectAllRows() {

  }

  handleChangeSelectRow() {

  }

  render() {
    const { store, rowKey } = this.props;
    if (!store) return null;

    return (
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
        sort={store.get('sort')}
      />
    );
  }
};


DataGridContainer.displayName = 'DataGridContainer';

DataGridContainer.propTypes = {
  // tableId & reducerName are used in redux
  // eslint-disable-next-line react/no-unused-prop-types
  tableId: PropTypes.string.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  reducerName: PropTypes.string.isRequired,
  screenReaderMode: PropTypes.bool,
  rowKey: PropTypes.string.isRequired,
  fetchData: PropTypes.func.isRequired,
  onChangeCell: PropTypes.func.isRequired,
  // actions
  initStore: PropTypes.func.isRequired,
  setGroups: PropTypes.func.isRequired,
  setColumns: PropTypes.func.isRequired,
  setRows: PropTypes.func.isRequired,
  setDisplayableRows: PropTypes.func.isRequired,
};

const mapStateToProps = (state, props) => {
  const { tableId, reducerName } = props;
  return {
    store: state[reducerName].get(tableId),
  }
};


const mapDispatchToProps = (dispatch, props) => {
  const { tableId } = props;
  return {
    initStore: compose(dispatch, initStore(tableId)),
    setColumns: compose(dispatch, setColumns(tableId)),
    setRows: compose(dispatch, setRows(tableId)),
    setGroups: compose(dispatch, setGroups(tableId)),
    setDisplayableRows: compose(dispatch, setDisplayableRows(tableId)),
    sort: compose(dispatch, sort(tableId)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DataGridContainer);
