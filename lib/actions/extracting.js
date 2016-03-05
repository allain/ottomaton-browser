var Action = require('ottomaton').Action
var Waiter = require('../waiter')

var debug = require('debug')('ottomaton:extracting');

module.exports = function(webdriver) {
  var wait = Waiter(webdriver);

  return [
    Action([
      /^Extract Text after label (.*) into (.*)$/,
      /^Extract Text after the label (.*) into (.*)$/,
      /^Remember Text after label (.*) as (.*)$/,
      /^Remember Text after the label (.*) as (.*)$/
    ], function(label, target) {
      //TODO: this is clearly too specific. It only works on the facebook app screen
      return `Extract Text from //div[preceding-sibling::span[contains(.,"${label}")]] into ${target}`;
    }, { deref: false }),

    Action([
      /^Extract Text from (.*) into (.*)$/i
    ], function extractText(src, target) {
      return wait.forElement(this.deref(src))
        .then(el => el.getAttribute('innerText'))
        .then(value => {
          this[target] = value
        })
    }, {
      deref: false
    }),

    Action([
      /^Extract HTML into (.*)$/i,
      /^Extract HTML as (.*)$/i
    ], function(target) {
      return webdriver.executeScript('return document.querySelector("html").outerHTML')
        .then(html => {
          this[ target ] = html;
        })
    }),

    Action([
      /^Extract(?: All) HTML$/i,
      /^Extract HTML from (.*) into (.*)$/i
    ], function(src, target) {
      target = target || 'html'

      return wait.forElement(this.deref(src))
        .then(el => el.getAttribute('outerHTML'))
        .then(html => {
          this[ target ] = html
        })
    })
  ];
};

