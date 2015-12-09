import { Action } from 'ottomaton';
import Waiter from '../waiter';

const debug = require('debug')('ottomaton:browser:typing');

module.exports = function(webdriver, ottomaton) {
  const wait = Waiter(webdriver);

  const Key = webdriver.Key;

  return [
    Action([
      /^Type (.+) into(?: the)? Search(?: Box)?$/,
      /^Enter (.+) into(?: the)? Search(?: Box)?$/
    ], text => `Type ${text} into q`),

    Action([
      /^Type (.+) into (.+) box$/i,
      /^Type (.+) into (.+)$/i
    ], async function(text, target) {
      target = target.trim();
      let input;
      if (target.indexOf('//') === 0) {
        input = await wait.forElement(target);
      } else {
        input = await wait.forFieldNamed(target);
      }

      await input.sendKeys(Key.chord(Key.CONTROL, 'a'), '' + text);

      // After typing we force a blur event to cause any watching buttons
      await webdriver.executeScript('var els = document.querySelectorAll("input,textarea"); if (!els && els.length === 0) return; var i = els.length; while (--i && i>=0) { els.item(i).blur(); };');
    })
  ];

};