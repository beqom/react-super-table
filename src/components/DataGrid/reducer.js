import Immutable from 'immutable';

import {
  TABLE_INIT,
  TABLE_SET_COLUMNS,
  TABLE_SET_ROWS,
  TABLE_SET_GROUPS,
  TABLE_SET_DISPLAYABLE_ROWS,
  TABLE_SORT,
} from './constants';

import { getHeaderRowsCount, sortColumns } from '../../libs/helpers';

const initialState = Immutable.Map({
  groups: Immutable.List(),
  columns: Immutable.List(),
  hiddenColumns: Immutable.Map(),
  sort: Immutable.Map(),
  rows: Immutable.List(),
  displayableRows: Immutable.List(),
  headerRowsCount: 1,
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
        .setIn([tableId, 'headerRowsCount'], getHeaderRowsCount(visibleColumns, groups) + 1)
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

    case TABLE_SORT: {
      const { tableId, columnKey, way } = action.payload;
      const sort = state.getIn([tableId, 'sort']);

      // reset
      if (sort.get('columnKey') === columnKey && sort.get('way') === -1) {
        return state.setIn([tableId, 'sort'], Immutable.Map());
      }

      const newWay = way || sort.get('columnKey') === columnKey
        ? sort.get('way') * -1
        : 1;

      return state
        .setIn([tableId, 'sort', 'columnKey'], columnKey)
        .setIn([tableId, 'sort', 'way'], newWay)
    }

    default:
      return state;
  }
}

export default TableReducer;
