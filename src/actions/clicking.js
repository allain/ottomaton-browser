import { Action } from 'ottomaton';
import Waiter from '../waiter';

import { ActionSequence } from 'selenium-webdriver';

const debug = require('debug')('ottomaton:clicking');

module.exports = function(webdriver, ottomaton) {
  const wait = Waiter(webdriver, {
    defaultTimeout: ottomaton.opts.defaultTimeout
  });

  return [
    Action(/^Check Checkbox (.*)/i, async function(checkboxName) {
      let checkbox = await wait.forCheckbox(checkboxName);

      //await webdriver.moveTo(checkbox);

      await wait.until(async function() {
        let result = await new ActionSequence(webdriver).click(checkbox).perform();
        return true;
      });

      await wait.ms(1000);
    }),

    Action([
      /^Click on (.+) Button/i,
      /^Click (.+) Button/i
    ], async function (target) {
      let button = await wait.forButton(target);

      await wait.until(async function() {
        let result = await new ActionSequence(webdriver).click(button).perform();
        debug('click result', result);
        return true;
      });

      await wait.ms(1000);
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
