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
  NUMBER: x => parseFloat(x, 10),
  IDENTITY: x => x,
};

const columns = Immutable.fromJS(data.columns)
  .map(col => col
    .set('formatter', FORMATTERS[col.get('formatter') || 'IDENTITY'])
    .set('parser', FORMATTERS[col.get('parser') || 'IDENTITY'])
  )
  .toJS();
const rows = data.rows;
const groups = data.groups;

storiesOf('Table', module)
  .addDecorator(withReadme(README))
  .addDecorator(story => {
    const store = createStore(combineReducers({ Table: reducer }));

    return (
      <Provider store={store}>
        <div style={{ margin: 50, height: 500 }}>
          {story()}
        </div>
      </Provider>
    );
  })
  // .addWithJSX('playground', () => (
  .add('playground', () => (
    <TableContainer
      tableId="playground"
      reducerName="Table"
      editable={boolean('editable', true)}
      groups={groups}
      columns={columns}
      rows={rows}
      rowKey="id"
    />
  ));
