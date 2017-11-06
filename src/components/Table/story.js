/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, text, number, color, array, object, select, date } from '@storybook/addon-knobs';
import withReadme from 'storybook-readme/with-readme';
import Immutable from 'immutable';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

import Table from './Table';

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

const columns = Immutable.fromJS(data.columns)
  .map(col =>
    col
      .set('formatter', FORMATTERS[col.get('formatter') || 'IDENTITY'])
      .set('parser', PARSERS[col.get('parser') || 'IDENTITY'])
  );

const rows = Immutable.fromJS(data.rows);
const groups = Immutable.fromJS(data.groups);


storiesOf('Table', module)
  .addDecorator(withReadme(README))
  .addDecorator(story => (
    <div style={{ margin: 50 }}>{story()}</div>
    ))
  // .addWithJSX('playground', () => (
  .add('playground', () => (
    <Table
      groups={groups}
      columns={columns}
      headerRowsCount={2}
      rows={boolean('empty', false) ? [] : rows.slice(0, number('rows', 10))}
      rowKey="id"
    />
  ));
