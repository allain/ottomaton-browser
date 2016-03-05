var Action = require('ottomaton').Action

var Waiter = require('../waiter')

module.exports = function(webdriver) {
  var wait = Waiter(webdriver)

  // Waiting forever really means wait for 1 hour
  return [
    Action(/^Wait for text (.*)$/i, wait.forText),
    Action(/^Wait for (.*) Link to be visible$/i , wait.forLink),
    Action(/^Wait forever for text (.*)$/i, text => wait.forText(text, 60 * 60 * 1000)),
    Action(/^Wait forever for (.*) Link to be visible$/i , label => wait.forLink(label, 60 * 60 * 1000))
  ]
}

