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
} from './actions';
import { formatRows } from './libs/helpers';
import Types from './Types';
import Table from './Table';

class TableContainer extends Component {
  constructor(props) {
    super(props);

    const rows = Immutable.fromJS(props.rows);
    const columns = Immutable.fromJS(props.columns);
    const groups = Immutable.fromJS(props.groups);

    props.initStore();
    props.setGroups(groups);
    props.setColumns(columns);
    props.setRows(rows);
    props.setDisplayableRows(formatRows(rows, columns));

    this.handleEditCell = this.handleEditCell.bind(this);
    this.handleChangeSelectAllRows = this.handleChangeSelectAllRows.bind(this);
    this.handleChangeSelectRow = this.handleChangeSelectRow.bind(this);
  }

  handleEditCell(rowKey, columnKey, value) {
    const rows = this.props.store.get('rows');
    const columns = this.props.store.get('columns');
    const displayableRows = this.props.store.get('displayableRows');
    const column = columns.find(c => c.get('key') === columnKey);
    const formatter = column.get('formatter');
    const parser = column.get('parser');
    const parsedValue = parser(value);
    const formattedValue = formatter(parsedValue);
    const rowIndex = rows.findIndex(r => r.get(this.props.rowKey) === rowKey);

    this.props.setRows(rows.setIn([rowIndex, columnKey], parsedValue));
    this.props.setDisplayableRows(displayableRows.setIn([rowIndex, columnKey], formattedValue));
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
        frozenColumns={store.get('frozenColumns')}
        unfrozenColumns={store.get('unfrozenColumns')}
        rows={store.get('displayableRows')}
        headerRowsCount={store.get('headerRowsCount')}
        onEditCell={this.handleEditCell}
        onChangeSelectAllRows={this.handleChangeSelectAllRows}
        onChangeSelectRow={this.handleChangeSelectRow}
      />
    );
  }
};


TableContainer.displayName = 'TableContainer';

TableContainer.propTypes = {
  tableId: PropTypes.string.isRequired,
  reducerName: PropTypes.string.isRequired,
  rowKey: PropTypes.string.isRequired,
  groups: PropTypes.arrayOf(Types.group).isRequired,
  columns: PropTypes.arrayOf(Types.column).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
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
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TableContainer);

