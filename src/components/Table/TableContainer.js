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
    props.setDisplayableRows(rows);
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

