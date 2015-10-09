var Action = require('ottomaton').Action;

var selenium = require('selenium-webdriver');
var By = selenium.By;

module.exports = function () {
  var driver = new selenium.Builder().withCapabilities(selenium.Capabilities.chrome()).build();

  var handle = driver.getWindowHandle();

  return handle.then(function () {
    return [
      Action([
        /^Open (https?:\/\/[^\s]*)$/i,
        /^Browse to (https?:\/\/[^\s]*)$/i,
        /^Navigate to (https?:\/\/[^\s]*)$/i
      ], function (url) {
        return driver.get(url);
      }),

      Action([
        /^Type (.+) into(?: the)? Search(?: Box)?$/,
        /^Enter (.+) into(?: the)? Search(?: Box)?$/
      ], function (text) {
        return driver.findElement(By.name('q')).sendKeys(text);
      }),

      Action([
        /^Wait for text (.*)$/i
      ], function(pattern) {
        pattern = pattern.trim();
        return driver.wait(function() {
          return driver.executeScript('return document.querySelector("html").outerText').then(function(text) {
            return text && text.indexOf(pattern) !== -1;
          });
        });
      }),

      Action([
        /^Click on (.+) Button/i,
        /^Click (.+) Button/i
      ], function (buttonName) {
        return driver.findElements(By.css('button, input[type=button], input[type=submit]')).then(function(buttons) {
          return Promise.all(buttons.map(function(button) {
            return button.getAttribute('value').then(function(value) {
              return value === buttonName ? button : null;
            });
          })).then(function(buttons) {
            return buttons.filter(Boolean);
          }).then(function(buttons) {
            return buttons[0];
          }).then(function(button) {
            if (!button) throw new Error('Button Not Found: ' + buttonName);

            return button.click();
          });
        });
      }),

      Action([
        /^Extract HTML into (.*)$/i,
        /^Extract HTML as (.*)$/i
      ], function(target) {
        console.log(target);
        return extractHTML.call(this, target);
      }),

      Action(/^Extract(?: All) HTML$/i, 'Extract HTML into html'),

      Action(Action.FINISH, function () {
        return extractHTML.call(this, 'html').then(function() {
          return driver.quit();
        });        
      })
    ];
  });

  function extractHTML(target) {
    return driver.executeScript('return document.querySelector("html").outerHTML').then(function (html) {
      this[target] = html;
    }.bind(this));
  }
};


