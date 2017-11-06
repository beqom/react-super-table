import React from 'react';
import { configure, addDecorator, setAddon } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import { setOptions } from '@storybook/addon-options';
import JSXAddon from 'storybook-addon-jsx';
import { withInfo, setDefaults } from '@storybook/addon-info';

import fixAddonInfo from './fixAddonInfo';

import '../src/style/index.scss';
import 'github-markdown-css';

setAddon(JSXAddon);

setOptions({
  name: 'Pretty UI',
  downPanelInRight: true ,
  showLeftPanel: true,
});


setDefaults({
  header: false, // Toggles display of header with component name and description
  source: false, // Displays the source of story Component
  styles: s => Object.assign({}, s, {
    infoBody: {},
    infoContent: {},
    infoStory: {},
    jsxInfoContent: {},
    header: {
      h1: {},
      h2: {},
      body: {},
    },
    source: {
      h1: {},
    },
    propTableHead: {},
  })
});


addDecorator((story, context) => withInfo('')(story)(context));

addDecorator(fixAddonInfo);

addDecorator(withKnobs);

function loadStories() {
  require('../src/components/DataGrid/story');
  require('../src/components/Table/story');
}

configure(loadStories, module);
