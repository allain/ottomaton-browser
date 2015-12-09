import factorize from 'factorize';
import defaults from 'defaults';

const debug = require('debug')('ottomaton:waiter');

function Waiter(webdriver, opts) {
  opts = defaults(opts, { defaultTimeout: 60 * 1000 });

  const By = webdriver.By;

  const DEFAULT_TIMEOUT = opts.defaultTimeout;

  async function until(predicate, timeout = DEFAULT_TIMEOUT, interval = 100) {
    let result;
    let count = 0;
    let startTime = Date.now();

    let slowedPredicate = async function() {
      var result = await predicate();
      if (!result) {
        await ms(interval);
      }

      return result;
    };

    while (true) {
      try {
        result = await webdriver.wait(slowedPredicate, timeout);

        if (Array.isArray(result) && result.length > 0) {
          debug('predicate returned: %j elements', result.length);

          break;
        } else if (result) {
          if (typeof result === 'object') {
            debug('predicate returned: 1 element');
          } else {
            debug('predicate returned: %j', result);
          }
          break;
        }
      } catch(e) {
        debug(e.message);
      }

      await ms(interval);

      if (Date.now() - startTime >= interval) {
        throw new Error('timeout');
      }

      debug('waiting... %d', ++count);
    }

    return result;
  }

  function forElements(predicate, timeout = DEFAULT_TIMEOUT) {
    if (typeof predicate === 'string') {
      if (predicate.match(/^\/\//)) {
        let xpath = predicate;
        predicate = function() {
          return webdriver.findElements(By.xpath(xpath));
        };
      } else {
        throw new Error('Invalid Element Predicate:' + predicate);
      }
    }

    return until(async function() {
      var elements = await predicate();
      debug('elements: %j', elements);
      if (!Array.isArray(elements)) return false;

      if (elements.length === 0) {
        return false;
      }

      elements = elements.filter(async function(el) {
        return await el.isDisplayed() && await el.isEnabled();
      });

      return elements.length ? elements : null;
    }, timeout);
  }

  async function forElement(predicate, timeout = DEFAULT_TIMEOUT) {
    let elements = await forElements(predicate, timeout);
    return elements[0];
  }

  async function forText(pattern, timeout = DEFAULT_TIMEOUT) {
    pattern = pattern.trim();
    debug('Waiting for text: ' + pattern);

    let found = await until(async function() {
      var text = await forScript('return document.querySelector("html").outerText');

      return text && text.indexOf(pattern) !== -1;
    }, timeout);

    debug('FOUND');

    return true;
  };

  async function forFieldNamed(field, timeout = DEFAULT_TIMEOUT) {
    debug('Waiting for field named: %s', field);

    let element = await forElement(async function() {
      return await webdriver.findElements(By.xpath('//input[contains(@name,"' + field + '")]'));
    }, timeout);

    debug('field found');

    return element;
  };

  async function forLink(linkText, timeout = DEFAULT_TIMEOUT) {
    debug('waiting for link with text: %s', linkText);

    let element = await forElement('//a[contains(.,"' + linkText + '")]', timeout);

    debug('link found');

    return element;
  };

  async function forButton(target, timeout = DEFAULT_TIMEOUT) {
    return until(async function() {
      let buttons;

      if (target.indexOf('//') === 0) {
        buttons = await forElements(target);
        debug('buttons found using xpath: %s %j', target, buttons);
      }

      if (!Array.isArray(buttons) || !buttons.length) {
        let cssSelector = `button[value="${target}"], input[type=button][value="${target}"], input[type=submit][value="${target}"]`;
        buttons = await webdriver.findElements(By.css(cssSelector));
        debug('buttons found with value: %s %j', target, buttons);
      }

      if (!Array.isArray(buttons) || !buttons.length) {
        let cssSelector = `button[name="${target}"], input[type=button][name="${target}"], input[type=submit][name="${target}"]`;
        buttons = await webdriver.findElements(By.css(cssSelector));
        debug('buttons found with name: %s %j', target, buttons);
      }

      if (!Array.isArray(buttons) || !buttons.length) {
        buttons = await webdriver.findElements(By.xpath('//button[contains(.,"' + target + '")]'));
        debug('buttons found with label: %s %j', target, buttons);
      }

      if (!Array.isArray(buttons) || !buttons.length) {
        debug('Not Buttons Found');
        return null;
      }

      let usableButtons = await Promise.all(buttons.map(async function(b) {
        return (await b.isDisplayed() && await b.isEnabled) ? b : null;
      }));

      usableButtons = usableButtons.filter(Boolean);

      debug('usable buttons %d', usableButtons.length);

      return usableButtons[0];
    }, timeout);
  };

  async function forCheckbox(target, timeout = DEFAULT_TIMEOUT) {
    return until(async function() {
      let checkboxes;

      if (target.indexOf('//') === 0) {
        checkboxes = await forElements(target);
        debug('checkboxes found using xpath: %s %j', target, checkboxes);
      }

      if (!Array.isArray(checkboxes) || !checkboxes.length) {
        let cssSelector = `input[type=checkbox][name="${target}"]`;
        checkboxes = await webdriver.findElements(By.css(cssSelector));
        debug('checkboxes found with name: %s %j', target, checkboxes);
      }

      if (!Array.isArray(checkboxes) || !checkboxes.length) {
        debug('Not Checkboxes Found');
        return null;
      }

      let usableCheckboxes = await Promise.all(checkboxes.map(async function(c) {
        return (await c.isDisplayed() && await c.isEnabled) ? c : null;
      }));

      usableCheckboxes = usableCheckboxes.filter(Boolean);

      debug('usable checkboxes %d', usableCheckboxes.length);

      return usableCheckboxes[0];
    }, timeout);
  };

  function forScript(script, timeout = DEFAULT_TIMEOUT) {
    return webdriver.wait(function () {
      return webdriver.executeScript(script);
    }, timeout);
  };

  function forUsable(buttons) {

  }

  function forActionable(actionSequence, timeout = DEFAULT_TIMEOUT) {
    return until(function() {
      return actionSequence.perform();
    }, timeout);
  };

  function ms(millis) {
    return new Promise(function(resolve) {
      setTimeout(resolve, millis);
    });
  };

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
  };
};

export default factorize(Waiter);