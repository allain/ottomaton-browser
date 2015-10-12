import { Action } from 'ottomaton';
import Waiter from '../waiter';

module.exports = function(webdriver, ottomaton) {
  const wait = Waiter(webdriver);

  return [
    Action([
      /^Type (.+) into(?: the)? Search(?: Box)?$/,
      /^Enter (.+) into(?: the)? Search(?: Box)?$/
    ], async function(text) {
      let searchBox = await wait.forFieldNamed('q');
      searchBox.sendKeys(text);
    }),

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

      return input.sendKeys(text);
    }),
  ];

};