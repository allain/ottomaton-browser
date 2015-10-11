import { Action } from 'ottomaton';

import Waiter from '../waiter';

module.exports = function(webdriver, ottomaton) {
  const wait = Waiter(webdriver);

  return [
    Action(/^Wait for text (.*)$/i, wait.forText),
    Action(/^Wait for (.*) Link to be visible$/i , wait.forLink)
  ];
};

