import { Action } from 'ottomaton';
import Waiter from '../waiter';

module.exports = function(webdriver, ottomaton) {
  const wait = Waiter(webdriver);

  return [
    Action(/^Extract(?: All) HTML$/i, 'Extract HTML into html'),

    Action([
      /^Extract HTML into (.*)$/i,
      /^Extract HTML as (.*)$/i
    ], extractHTML),

    Action([
      /^Extract Text after label (.*) into (.*)$/,
      /^Remember Text after label (.*) as (.*)$/,
    ], function(label, target) {
      return `Extract Text from //*[preceding-sibling::span[contains(.,${label}]] into ${target}`;
    }),

    Action([
      /^Extract Text from (.*) into (.*)$/i
    ], async function extractText(src, target) {
      var el = await wait.forElement(src);

      var text = await el.executeScript('return this.innerText;');

      this[target] = text;
    })
  ];

  async function extractHTML(target) {
    var html = await webdriver.executeScript('return document.querySelector("html").outerHTML');

    this[target] = html;
  }
};

