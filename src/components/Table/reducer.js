import Immutable from 'immutable';

import {
  TABLE_INIT,
  TABLE_SET_COLUMNS,
  TABLE_SET_ROWS,
  TABLE_SET_GROUPS,
  TABLE_SET_DISPLAYABLE_ROWS,
} from './constants';

import { getHeaderRowsCount, sortColumns } from './libs/helpers';

const initialState = Immutable.Map({
  groups: Immutable.List(),
  columns: Immutable.List(),
  frozenColumns: Immutable.List(),
  unfrozenColumns: Immutable.List(),
  rows: Immutable.List(),
  displayableRows: Immutable.List(),
});

function TableReducer(state = Immutable.Map(), action = {}) {
  switch(action.type) {
    case TABLE_INIT:
      return state.set(action.payload.tableId, initialState);

    case TABLE_SET_COLUMNS: {
      const { tableId } = action.payload;
      const groups = state.getIn([tableId, 'groups']);
      const columns = sortColumns(action.payload.columns);
      const visibleColumns = columns.filter(c => c.getIn(['layout', 'visible']));

      return state
        .setIn([tableId, 'columns'], columns)
        .setIn([tableId, 'visibleColumns'], visibleColumns)
        .setIn([tableId, 'frozenColumns'], visibleColumns.filter(c => c.getIn(['layout', 'frozen'])))
        .setIn([tableId, 'unfrozenColumns'], visibleColumns.filter(c => !c.getIn(['layout', 'frozen'])))
        .setIn([tableId, 'headerRowsCount'], getHeaderRowsCount(columns, groups) + 1)
    }

    case TABLE_SET_ROWS: {
      const { tableId, rows } = action.payload;
      return state.setIn([tableId, 'rows'], rows);
    }

    case TABLE_SET_DISPLAYABLE_ROWS: {
      const { tableId, rows } = action.payload;
      return state.setIn([tableId, 'displayableRows'], rows);
    }

    case TABLE_SET_GROUPS: {
      const { tableId, groups } = action.payload;
      const columns = state.getIn([tableId, 'columns']);

      return state
        .setIn([tableId, 'groups'], groups)
        .setIn([tableId, 'headerRowsCount'], getHeaderRowsCount(columns, groups) + 1);
    }

    default:
      return state;
  }
}

export default TableReducer;
