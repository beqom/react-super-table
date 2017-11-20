# Data Grid

demo: https://beqom.github.io/data-grid/


## Getting started

### Install

```sh
$ npm install @beqom/data-grid --save

# or

$ yarn add @beqom/data-grid
```

Be sure to have all the required peer dependencies:

- **classnames**: `>=2.0.0`
- **immutable**: `>=3.8.0`
- **lodash**: `>=4.0.0`
- **pretty-ui**: `^0.1.1`
- **prop-types**: `>=15.0.0`
- **react**: `>=15.0.0`
- **react-dom**: `>=15.0.0`
- **react-immutable-proptypes**: `>=2.1.0`
- **react-redux**: `>=5.0.0`
- **redux**: `>=3.0.0`

### Webpack

You need to support the `scss` imports of the components. you will need those loaders as **devDependencies**:

- **style-loader**
- **css-loader**
- **sass-loader**

`webpack.config.js`

```js
{
  module: {
    rules: [
      {
        // be sure to not exclude node modules
        test: /\.s?css$/,
        loaders: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
}
```

### Redux

You need to import the reducer in your store:

`reducer.js`

```js
import { reducer as DataGridReducer } from '@beqom/data-grid';
import { combineReducers } from 'redux';

export default combineReducers({
  DataGridReducer,
  // other reducers...
});
```

## Usage

### Props

#### `tableId`

`PropTypes.string.isRequired`

As the reducer is shared between all DataGrid instance, an unique id is needed.
Could be generated randomly in the contructor of your component.

#### `reducerName`

`PropTypes.string.isRequired``

Name of the reducer you gave when you added to redux with combineReducer.


#### `rowKey``

`PropTypes.string.isRequired`

Column key that identify a row as unique. Often "id".

#### `fetchData`

`PropTypes.func.isRequired``

Function that return a promise. This promise should return the following result:

```js
{
  // Should be wrap in Immutable.fromJS()
  groups: [
    { key: "identity", title: "Identity", },
    { key: "name", title: "Name", group: "identity" },
    { key: "address", title: "Address" },
    // ...
  ],
  // Should be wrap in Immutable.fromJS()
  columns: [
    {
      key: "firstname",
      title: "Firstname",
      order: 2,
      dataType: "string",
      layout: { visible: true, width: 120 },
      editable: false,
      formula: null,
      formatter: null,
      group: "name",
      editorType: "text"
    }
    // ...
  ],
  // Should be wrap in Immutable.fromJS()
  rows: [
    { idEmployee: "123", fistname: "Bob", /* ... */},
    // ...
  ],
  settings: {
    // optionnal
    sort: {
      columnKey: "firstname",
      way: 1, // 1: ASC, -1: DESC
    },
    // optionnal
    pagination: {
      max: 9, // number of pages
      rowsPerPage: 10,
      current: 1, // current page between 1 --> max
    } ,
  },
}
```

See example for mor informations.


#### `onChangeCell`

`PropTypes.func.isRequired`

A function that is called when the content of a cell change and might need to be push to the server.
This call is already debounced.

See example for mor informations.

### Example

```js
import Immutable from 'immutable';
import { DataGrid } from '@beqom/data-grid';

const fetchData = settings => {
  const { pagination, sort } = settings;
  const url = `my-domain.com/api/employees?
    sortway${sort.way}&
    sortcolumn${sort.column}&
    currentpage${pagination.current}&
    pagesize${pagination.rowsPerPage}&
  `;

  return fetch(url)
    .then(result => ({
      columns: Immutable.fromJs(formatColumns(result.fields)),
      rows: Immutable.fromJs(result.rows),
      settings,
      groups: Immutable.fromJs(formatGroup(result.feildsParent)),
    }));
}

const handleChangeCell = ({
  key,
  value,
  rowIndex,
  row,
  rows,
  column,
  columns
}) => {
  fetch(`my-domain.com/api/employees/${key}`, {
    method: 'PUT',
    body: JSON.stringify(value),
  });
}

const EmployeeGrid = ({ id }) => (
  <DataGrid
    tableId={id}
    reducerName="DataGridReducer"
    rowKey="idEmployee"
    fetchData={fetchData}
    onChangeCell={handleChangeCell}
  />
);
```
