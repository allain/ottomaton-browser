var Action = require('ottomaton').Action
var selenium = require('selenium-webdriver')

var Waiter = require ('./waiter')
var debug = require('debug')('ottomaton-browser');

module.exports = function (ottomaton) {
  var webdriver = new selenium.Builder().withCapabilities(selenium.Capabilities.chrome()).build();

  // Wait till the browser is actually loaded
  return webdriver.getWindowHandle().then(() => {

    webdriver.By = selenium.By;
    webdriver.Key = selenium.Key;

    ottomaton.webdriver = webdriver;
    ottomaton.extraState.webdriver = webdriver;
    ottomaton.extraState.wait = new Waiter(webdriver);

    var actions = [ 'navigating', 'clicking', 'waiting', 'typing', 'extracting' ].map(type => {
      return require('./actions/' + type)(webdriver, ottomaton);
    });

    // Register FINISH to close the driver and record the last page's html
    actions.push(Action(Action.FINISH, function () {
      return webdriver.executeScript('return document.querySelector("html").outerHTML').then(html => {
        this.html = html;
        if (!this.keep)
          return webdriver.quit();
      })
    }));

    return actions;
  })
};
