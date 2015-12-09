import { Action } from 'ottomaton';
import Waiter from '../waiter';

const debug = require('debug')('ottomaton:extracting');

module.exports = function(webdriver, ottomaton) {
  const wait = Waiter(webdriver);

  return [
    Action([
      /^Extract Text after label (.*) into (.*)$/,
      /^Extract Text after the label (.*) into (.*)$/,
      /^Remember Text after label (.*) as (.*)$/,
      /^Remember Text after the label (.*) as (.*)$/,
    ], function(label, target) {
      //TODO: this is clearly too specific. It only works on the facebook app screen
      return `Extract Text from //div[preceding-sibling::span[contains(.,"${label}")]] into ${target}`;
    }, { deref: false }),

    Action([
      /^Extract Text from (.*) into (.*)$/i
    ], async function extractText(src, target) {
      var el = await wait.forElement(this.deref(src));
      this[target] = await el.getAttribute('innerText');
    }, {
      deref: false
    }),

    Action([
      /^Extract HTML into (.*)$/i,
      /^Extract HTML as (.*)$/i
    ], async function(target) {
      var html = await webdriver.executeScript('return document.querySelector("html").outerHTML');
      this[target] = html;
    }),

    Action([
      /^Extract(?: All) HTML$/i,
      /^Extract HTML from (.*) into (.*)$/i
    ], async function(src, target = 'html') {
      var el = await wait.forElement(this.deref(src));
      this[target] = await el.getAttribute('outerHTML');
    })
  ];
};

