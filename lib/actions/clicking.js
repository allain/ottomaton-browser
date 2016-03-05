var Action = require('ottomaton').Action
var Waiter = require('../waiter')

var ActionSequence = require('selenium-webdriver').ActionSequence

var debug = require('debug')('ottomaton:clicking');

module.exports = function(webdriver, ottomaton) {
  var wait = Waiter(webdriver, {
    defaultTimeout: ottomaton.opts.defaultTimeout
  });

  return [
    Action(/^Check Checkbox (.*)/i, function(checkboxName) {
      return wait.forCheckbox(checkboxName)
        .then(checkbox => wait.until(() => new ActionSequence(webdriver).click(checkbox).perform().then(() => true)))
        .then(() => wait.ms(1000))
    }),

    Action([
      /^Click on (.+) Button/i,
      /^Click (.+) Button/i
    ], function (target) {
      return wait.forButton(target)
        .then(button => wait.until(() => new ActionSequence(webdriver).click(button).perform().then(() => true)))
        .then(() => wait.ms(1000))
    }),

    Action([
      /^Click on (.+) Link/i,
      /^Click (.+) Link/i
    ], function(linkText) {
      return wait.forElement('//a[contains(.,"' + linkText + '")]')
        .then(link => wait.until(() => new ActionSequence(webdriver).click(link).perform().then(() => true)))
        .then(() => wait.ms(1000))
    })
  ];
};
