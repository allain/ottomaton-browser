import { Action } from 'ottomaton';
import Waiter from '../waiter';

module.exports = function(webdriver, ottomaton) {
  const wait = Waiter(webdriver);

  return [
    Action([
      /^Click on (.+) Button/i,
      /^Click (.+) Button/i
    ], async function (buttonName) {
      let button = await wait.forButton(buttonName);
      await button.click();
      await wait.ms(1000);
    }),

    Action([
      /^Click on (.+) Link/i,
      /^Click (.+) Link/i
    ], async function(linkText) {
      // Wait for the click to not fail
      let link = await wait.element('//a[contains(.,"' + linkText + '")]');

      await wait.forActioned(new ActionSequence(webdriver).click(link));

    })
  ];
};