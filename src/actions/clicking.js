import { Action } from 'ottomaton';
import Waiter from '../waiter';

import { ActionSequence } from 'selenium-webdriver';

const debug = require('debug')('ottomaton:clicking');


module.exports = function(webdriver, ottomaton) {
  const wait = Waiter(webdriver);

  return [
    Action([
      /^Click on (.+) Button/i,
      /^Click (.+) Button/i
    ], async function (buttonName) {
      let button = await wait.forButton(buttonName);
      await wait.until(async function() {
        await new ActionSequence(webdriver).click(button).perform();
        return true;
      });

      debug('clicked');
      debug('sleeping for 1000ms');
      await wait.ms(1000);
      debug('done sleeping');
    }),

    Action([
      /^Click on (.+) Link/i,
      /^Click (.+) Link/i
    ], async function(linkText) {
      // Wait for the click to not fail
      let link = await wait.forElement('//a[contains(.,"' + linkText + '")]');
      debug('%s link found', linkText);

      await wait.until(async function() {
        await new ActionSequence(webdriver).click(link).perform();

        return true;
      });

      debug('clicked');
      debug('sleeping for 1000ms');
      await wait.ms(1000);
      debug('done sleeping');
    })
  ];
};