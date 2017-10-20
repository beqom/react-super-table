export const getHeaderRowsCount = (columns, groups) => {
  const colGroups = columns
    .filter(column => column.getIn(['layout', 'visible']) !== false)
    .map(column => column.get('group'))
    .filter((key, i, arr) => !!key && arr.indexOf(key) === i)
    .map(key => groups.find(g => g.get('key') === key))
    .filter(g => !!g);
  if (colGroups.size) {
    return 1 + getHeaderRowsCount(colGroups, groups);
  }
  return 0;
};

export const sortColumns = columns =>
  columns.sort((a, b) => {
    if (a.order < b.order) return -1;
    if (a.order > b.order) return 1;
    return 0;
  });


export const formatRows = (rows, columns) => rows;
