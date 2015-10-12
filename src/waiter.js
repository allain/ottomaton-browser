import factorize from 'factorize';

const debug = require('debug')('ottomaton:waiter');

function Waiter(webdriver) {
  const By = webdriver.By;

  async function until(predicate, timeout = 10000, interval = 100) {
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
        debug('predicate returned: %j', result);
        if (Array.isArray(result) && result.length > 0) {
          break;
        } else if (result) {
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
  };

  function forElement(predicate, timeout = 10000) {
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
      if (!Array.isArray(elements)) return false;

      if (elements.length === 0) {
        return false;
      }

      debug('%d elements found', elements.length);
      var element = elements[0];
      var isDisplayed = await element.isDisplayed();
      debug('isDisplayed', isDisplayed);
      if (!isDisplayed)
        return false;

      var isEnabled = await element.isEnabled();
      debug('isEnabled', isEnabled);
      if (!isEnabled)
        return false;

      return element;
    }, timeout);
  };

  async function forText(pattern, timeout = 10000) {
    pattern = pattern.trim();
    debug('Waiting for text: ' + pattern);

    let found = await until(async function() {
      var text = await forScript('return document.querySelector("html").outerText');

      return text && text.indexOf(pattern) !== -1;
    }, timeout);

    debug('Text Found');
    return true;
  };

  async function forFieldNamed(field, timeout = 10000) {
    debug('Waiting for field named: %s', field);

    let element = await forElement(async function() {
      return await webdriver.findElements(By.xpath('//input[contains(@name,"' + field + '")]'));
    }, timeout);

    debug('field found');

    return element;
  };

  async function forLink(linkText, timeout = 10000) {
    debug('waiting for link with text: %s', linkText);

    let element = await forElement('//a[contains(.,"' + linkText + '")]', timeout);

    debug('link found');

    return element;
  };

  async function forButton(target, timeout = 10000) {
    return until(async function() {
      let buttons;

      if (target.indexOf('//') === 0) {
        buttons = await forElements(target);
      }

      if (!Array.isArray(buttons) || !buttons.length) {
        let cssSelector = `button[value="${target}"], input[type=button][value="${target}"], input[type=submit][value="${target}"]`;
        buttons = await webdriver.findElements(By.css(cssSelector));
      }

      if (!Array.isArray(buttons) || !buttons.length) {
        buttons = await webdriver.findElements(By.xpath('//button[contains(.,"' + target + '")]'));
      }

      if (!Array.isArray(buttons) || !buttons.length) {
        debug('Not Found');
        return null;
      }

      buttons = buttons.filter(async function(b){
        return await e.isDisplayed() && await element.isEnabled();
      });

      return buttons[0];
    });
  };

  function forScript(script, timeout = 10000) {
    return webdriver.wait(function () {
      return webdriver.executeScript(script);
    });
  };

  function forActionable(actionSequence, timeout = 10000) {
    return until(function() {
      return actionSequence.perform();
    });
  };

  function ms(millis) {
    return new Promise(function(resolve) {
      setTimeout(resolve, millis);
    });
  };

  return {
    forActionable,
    forButton,
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