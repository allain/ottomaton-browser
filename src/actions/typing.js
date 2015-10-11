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
    ], async function(text, fieldName) {
      let input = await wait.forFieldNamed(fieldName);

      return input.sendKeys(text);
    }),
  ];

};