import {
  TABLE_INIT,
  TABLE_SET_COLUMNS,
  TABLE_SET_ROWS,
  TABLE_SET_GROUPS,
  TABLE_SET_DISPLAYABLE_ROWS,
  TABLE_SORT,
} from './constants';


export const initStore = tableId => () => ({
  type: TABLE_INIT,
  payload: {
    tableId,
  },
});

export const setColumns = tableId => columns => ({
  type: TABLE_SET_COLUMNS,
  payload: {
    tableId,
    columns,
  },
});

export const setRows = tableId => rows => ({
  type: TABLE_SET_ROWS,
  payload: {
    tableId,
    rows,
  },
});

export const setGroups = tableId => groups => ({
  type: TABLE_SET_GROUPS,
  payload: {
    tableId,
    groups,
  },
});

export const setDisplayableRows = tableId => rows => ({
  type: TABLE_SET_DISPLAYABLE_ROWS,
  payload: {
    tableId,
    rows,
  },
});

export const sort = tableId => (columnKey, way) => ({
  type: TABLE_SORT,
  payload: {
    tableId,
    columnKey,
    way,
  },
});


