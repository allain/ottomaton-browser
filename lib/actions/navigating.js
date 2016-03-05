var Action = require('ottomaton').Action

module.exports = function(webdriver) {
  return Action([
    /^Open (file:\/\/\/[^\s]*)$/i,
    /^Open (https?:\/\/[^\s]*)$/i,
    /^Browse to (https?:\/\/[^\s]*)$/i,
    /^Navigate to (https?:\/\/[^\s]*)$/i
  ], url => webdriver.get(url));
};