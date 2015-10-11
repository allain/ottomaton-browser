import { Action } from 'ottomaton';

import selenium from 'selenium-webdriver';

const debug = require('debug')('ottomaton-browser');

const ActionSequence = selenium.ActionSequence;
const By = selenium.By;

export default async function (ottomaton) {
  const webdriver = new selenium.Builder().withCapabilities(selenium.Capabilities.chrome()).build();

  // Wait tillt he browser is actually loaded
  const handle = await webdriver.getWindowHandle();

  webdriver.By = selenium.By;

  ottomaton.webdriver = webdriver;

  var actions = [];

  ['navigating', 'clicking', 'waiting', 'typing', 'extracting'].forEach(type => {
    actions.push(require('./actions/' + type)(webdriver, ottomaton));
  });

  // Register FINISH to close the driver and record the last page's html
  actions.push(Action(Action.FINISH, async function() {
    this.html = await webdriver.executeScript('return document.querySelector("html").outerHTML');;

    if (!this.keep)
      return webdriver.quit();
  }));


  return actions;
};
