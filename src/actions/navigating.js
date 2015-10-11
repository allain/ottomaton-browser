import { Action } from 'ottomaton';

module.exports = function(webdriver, ottomaton) {
  return Action([
    /^Open (file:\/\/\/[^\s]*)$/i,
    /^Open (https?:\/\/[^\s]*)$/i,
    /^Browse to (https?:\/\/[^\s]*)$/i,
    /^Navigate to (https?:\/\/[^\s]*)$/i
  ], url => webdriver.get(url));
};