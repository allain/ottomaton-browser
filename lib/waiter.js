
var defaults = require('defaults')

var debug = require('debug')('ottomaton:waiter');

function Waiter(webdriver, opts) {
  if (!(this instanceof Waiter))
    return new Waiter(webdriver, opts)

  opts = defaults(opts, { defaultTimeout: 60 * 1000 });

  var By = webdriver.By;

  var DEFAULT_TIMEOUT = opts.defaultTimeout;

  function until(predicate, timeout, interval) {
    timeout = timeout || DEFAULT_TIMEOUT
    interval = interval || 100

    var count = 0;
    var expires = Date.now() + timeout

    var slowedPredicate = function() {
      return Promise.resolve(predicate()).then(result => {
        return result || ms(interval)
      })
    }

    function tick() {
        return webdriver.wait(slowedPredicate(), timeout).then(result => {
          if (Array.isArray(result) && result.length > 0) {
            debug('predicate returned: %j elements', result.length);
            return result
          } else if (result) {
            if (typeof result === 'object') {
              debug('predicate returned: 1 element');
            } else {
              debug('predicate returned: %j', result);
            }
            return result;
          } else if (Date.now() < expires) {
            debug('waiting... %d', ++count);
            return ms(interval).then(tick)
          } else {
            throw new Error('timeout')
          }
        }).catch(e => {
          debug('wait error: %s', e.message)
          if (Date.now() < expires) {
            debug('waiting... %d', ++count);
            return ms(interval).then(tick)
          }

          throw new Error('timeout');
        })
    }

    return tick();
  }

  function forElements(predicate, timeout) {
    timeout = timeout || DEFAULT_TIMEOUT

    if (typeof predicate === 'string') {
      if (predicate.match(/^\/\//)) {
        var xpath = predicate;
        predicate = function() {
          return webdriver.findElements(By.xpath(xpath));
        };
      } else {
        throw new Error('Invalid Element Predicate:' + predicate);
      }
    }

    return until(function() {
      return predicate().then(elements => {
        debug('elements: %j', elements);
        if (!Array.isArray(elements) || elements.length === 0)
          return false;

        return promiseFilter(elements, el => {
          return el.isDisplayed().then(displayed => {
            return displayed ? el.isEnabled() : false;
          })
        });
      })
    }, timeout);
  }

  function forElement(predicate, timeout) {
    return forElements(predicate, timeout)
      .then(els => els[0]);
  }

  function forText(pattern, timeout) {
    pattern = pattern.trim();
    debug('Waiting for text: ' + pattern);

    return until(function() {
      return forScript('return document.querySelector("html").outerText').then(text => {
        return text && text.indexOf(pattern) !== -1;
      })
    }, timeout);
  }

  function forFieldNamed(field, timeout) {
    debug('Waiting for field named: %s', field);

    return forElement(() => {
      return webdriver.findElements(By.xpath('//input[contains(@name,"' + field + '")]'))
    }, timeout);
  }

  function forLink(linkText, timeout) {
    debug('waiting for link with text: %s', linkText);

    return forElement('//a[contains(.,"' + linkText + '")]', timeout)
  }

  function forButton(target, timeout) {
    return until(function() {
      var buttons;
      if (target.indexOf('//') === 0) {
        buttons = forElements(target, timeout)
      } else {
        buttons = webdriver.findElements(By.css(`button[value="${target}"], input[type=button][value="${target}"], input[type=submit][value="${target}"]`))
          .then(buttons => {
            if (Array.isArray(buttons) && buttons.length)
              return buttons;

            return webdriver.findElements(By.css(`button[name="${target}"], input[type=button][name="${target}"], input[type=submit][name="${target}"]`))
          })
          .then(buttons => {
            if (Array.isArray(buttons) && buttons.length)
              return buttons

            return webdriver.findElements(By.xpath('//button[contains(.,"' + target + '")]'))
          });
      }

      return buttons.then(buttons => {
        if (!Array.isArray(buttons) || !buttons.length) {
          debug('Not Buttons Found');
          return null;
        }

        return promiseFilter(buttons, b => {
          return b.isDisplayed().then(displayed => {
            return displayed ? b.isEnabled() : false;
          })
        }).then(usableButtons => usableButtons[0])
      })
    }, timeout);
  }

  function forCheckbox(target, timeout) {
    return until(function() {
      var checkboxes;

      if (target.indexOf('//') === 0) {
        checkboxes = forElements(target);
      } else {
        checkboxes = webdriver.findElements(By.css(`input[type=checkbox][name="${target}"]`))
      }

      return checkboxes.then(checkboxes => {
        if (!Array.isArray(checkboxes) || !checkboxes.length) {
          debug('Not Checkboxes Found');
          return null;
        }

        return promiseFilter(checkboxes, b => {
          return b.isDisplayed().then(displayed => {
            return displayed ? b.isEnabled() : false;
          })
        }).then(usableCheckboxes => usableCheckboxes[ 0 ])
      })
    }, timeout);
  }

  function forScript(script, timeout) {
    return webdriver.wait(function () {
      return webdriver.executeScript(script);
    }, timeout);
  }

  function forActionable(actionSequence, timeout) {
    return until(() => actionSequence.perform(), timeout)
  }

  return {
    forActionable,
    forButton,
    forCheckbox,
    forElement,
    forFieldNamed,
    forLink,
    forScript,
    forText,
    until,
    ms
  }
}

function ms(millis, value) {
  return new Promise(function(resolve) {
    setTimeout(() => {
      resolve(value)
    }, millis);
  });
}

function promiseFilter(items, test) {
  return Promise.all(items.filter(test)).then(result => result.filter(Boolean))
}

module.exports = Waiter;

