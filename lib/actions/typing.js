var Action = require('ottomaton').Action
var Waiter = require('../waiter')
var debug = require('debug')('ottomaton:browser:typing');

module.exports = function(webdriver) {
  var wait = Waiter(webdriver);

  var Key = webdriver.Key;

  return [
    Action([
      /^Type (.+) into(?: the)? Search(?: Box)?$/,
      /^Enter (.+) into(?: the)? Search(?: Box)?$/
    ], text => `Type ${text} into q`),

    Action([
      /^Type (.+) into (.+) box$/i,
      /^Type (.+) into (.+)$/i
    ], function(text, target) {
      target = target.trim();
      var input;
      if (target.indexOf('//') === 0) {
        input = wait.forElement(target);
      } else {
        input = wait.forFieldNamed(target);
      }

      return input.then(input => {
        return input.sendKeys(Key.chord(Key.CONTROL, 'a'), '' + text);
      }).then(() => {
        // After typing we force a blur event to cause any watching buttons
        return webdriver.executeScript(`
          var els = document.querySelectorAll("input,textarea");
          if (!els && els.length === 0) return;
          var i = els.length;
          while (--i && i>=0) els.item(i).blur();`);
      })
    })
  ];

};