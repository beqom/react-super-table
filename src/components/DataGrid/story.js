/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, text, number, color, array, object, select, date } from '@storybook/addon-knobs';
import withReadme from 'storybook-readme/with-readme';
import Immutable from 'immutable';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import compose from 'lodash/fp/compose';

import DataGridContainer from './DataGridContainer';
import reducer from './reducer';
import README from './README.md';

import data from '../../data.json';

const FORMATTERS = {
  CURRENCY: x => `$ ${parseFloat(x, 10).toFixed(2)}`,
  PERCENTAGE: x => `${x * 100}%`,
  IDENTITY: x => x,
};

const PARSERS = {
  NUMBER: x => parseFloat(`${x}`.replace(/[^0-9.,-]/g, '').replace(',', '.'), 10),
  IDENTITY: x => x,
};

const sortRows = sort => rows => (
  sort && sort.columnKey
    ? rows.sort((a, b) => {
      if (a.get(sort.columnKey) > b.get(sort.columnKey) ) return sort.way;
      if (a.get(sort.columnKey) < b.get(sort.columnKey) ) return sort.way * -1;
      return 0;
    })
    : rows
  );

const applyPagination = ({ current, rowsPerPage }) => rows => {
  const startIndex = rowsPerPage * (current - 1);
  return rows.slice(startIndex, startIndex + rowsPerPage);
}

class FakeDataService {
  constructor(d) {
    this.columns = Immutable.fromJS(d.columns)
      .map(col =>
        col
          .set('formatter', FORMATTERS[col.get('formatter') || 'IDENTITY'])
          .set('parser', PARSERS[col.get('parser') || 'IDENTITY'])
      )
      .sort((a, b) => {
        if (a.get('order') > b.get('order')) return 1;
        if (a.get('order') < b.get('order')) return -1;
        return 0;
      })

    this.rows = Immutable.fromJS(d.rows);
    this.groups = Immutable.fromJS(d.groups);

    this.fetchData = this.fetchData.bind(this);
    this.onChangeCell = this.onChangeCell.bind(this);

    const rowsPerPage = 10;

    this.initialSettings = {
      pagination: {
        max: Math.ceil(this.rows.size / rowsPerPage),
        current: 1,
        rowsPerPage,
      },
    };
  }

  fetchData(newSettings = {}) {
    const settings = Object.assign({}, this.initialSettings, newSettings);
    const rows = compose(
      applyPagination(settings.pagination),
      sortRows(settings.sort)
    )(this.rows);

    return Promise.resolve({
      rows,
      settings,
      columns: this.columns,
      groups: this.groups,
    })
  }

  onChangeCell({ rowIndex, key, value }) {
    this.rows = this.rows.setIn([rowIndex, key], value);
  }
}

storiesOf('DataGrid', module)
  .addDecorator(withReadme(README))
  .addDecorator(story => {
    const store = createStore(combineReducers({ DataGrid: reducer }));

    return (
      <Provider store={store}>
        <div style={{ margin: 50 }}>{story()}</div>
      </Provider>
    );
  })
  // .addWithJSX('playground', () => (
  .add('playground', () => {
    const fakeDataService = new FakeDataService(data);

    return (
      <DataGridContainer
        tableId="playground"
        reducerName="DataGrid"
        fetchData={fakeDataService.fetchData}
        onChangeCell={fakeDataService.onChangeCell}
        rowKey="id"
      />
    );
  });
