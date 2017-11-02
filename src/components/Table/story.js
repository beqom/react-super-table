/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, text, number, color, array, object, select, date } from '@storybook/addon-knobs';
import withReadme from 'storybook-readme/with-readme';
import Immutable from 'immutable';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

import TableContainer from './TableContainer';
import reducer from './reducer';
import README from './README.md';

import data from './data.json';

const FORMATTERS = {
  CURRENCY: x => `$ ${parseFloat(x, 10).toFixed(2)}`,
  PERCENTAGE: x => `${x * 100}%`,
  IDENTITY: x => x,
};

const PARSERS = {
  NUMBER: x => parseFloat(`${x}`.replace(/[^0-9.,-]/g, '').replace(',', '.'), 10),
  IDENTITY: x => x,
};

const columns = Immutable.fromJS(data.columns)
  .map(col =>
    col
      .set('formatter', FORMATTERS[col.get('formatter') || 'IDENTITY'])
      .set('parser', PARSERS[col.get('parser') || 'IDENTITY'])
  )
  .toJS();

storiesOf('Table', module)
  .addDecorator(withReadme(README))
  .addDecorator(story => {
    const store = createStore(combineReducers({ Table: reducer }));

    return (
      <Provider store={store}>
        <div style={{ margin: 50 }}>{story()}</div>
      </Provider>
    );
  })
  // .addWithJSX('playground', () => (
  .add('playground', () => (
    <TableContainer
      tableId="playground"
      reducerName="Table"
      screenReaderMode={boolean('screenReaderMode', false)}
      groups={data.groups}
      columns={columns}
      rows={data.rows.slice(0, 10)}
      rowKey="id"
    />
  ));
