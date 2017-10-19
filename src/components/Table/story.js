/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, text, number, color, array, object, select, date } from '@storybook/addon-knobs';
import withReadme from 'storybook-readme/with-readme';
import Immutable from 'immutable';

import Table from './Table';
import README from './README.md';

import data from './data.json';

const FORMATTERS = {
  CURRENCY: x => `$ ${x.toFixed(2)}`,
  PERCENTAGE: x => `${x * 100}%`,
};

const columns = Immutable.fromJS(data.columns).map(col => col.set('formatter', FORMATTERS[col.get('formatter')])).toJS();
const rows = data.rows;
const groups = data.groups;

storiesOf('Table', module)
  .addDecorator(withReadme(README))
  .addDecorator(story => <div style={{ margin: 50, height: 500 }}>{story()}</div>)
  // .addWithJSX('playground', () => (
  .add('playground', () => (
    <Table
      editable={boolean('editable', true)}
      groups={groups}
      columns={columns}
      rows={rows}
      rowKey="id"
    />
  ));
