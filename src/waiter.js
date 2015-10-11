import factorize from 'factorize';

const debug = require('debug')('ottomaton:waiter');

function Waiter(webdriver) {
  const By = webdriver.By;

  async function until(predicate) {
    let result;
    let count = 0;

    while (true) {
      try {
        result = await webdriver.wait(predicate);
        if (Array.isArray(result) && result.length > 0) {
          break;
        } else if (result) {
          break;
        }
      } catch(e) {
        debug(e.message);
      }

      await delay(1000);

      debug('waiting... %d', ++count);
    }

    return result;
  };

  function forElement(predicate) {
    if (typeof predicate === 'string') {
      if (predicate.match(/^\/\//)) {
        let xpath = predicate;
        predicate = function() {
          return webdriver.findElements(By.xpath(xPath));
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
    });
  };

  async function forText(pattern) {
    pattern = pattern.trim();
    debug('Waiting for text: ' + pattern);

    let found = await until(async function() {
      var text = await forScript('return document.querySelector("html").outerText');

      return text && text.indexOf(pattern) !== -1;
    });

    debug('Text Found');
    return true;
  };

  async function forFieldNamed(field) {
    debug('Waiting for field named: %s', field);

    let element = await forElement(async function() {
      return await webdriver.findElements(By.xpath('//input[contains(@name,"' + field + '")]'));
    });

    debug('field found');

    return element;
  };

  async function forLink(linkText) {
    debug('waiting for link with text: %s', linkText);

    let element = await forElement('//a[contains(.,"' + linkText + '")]');

    debug('link found');

    return element;
  };

  function forButton(buttonName) {
    return until(async function() {
      debug('Trying to find button with value set to %s', buttonName);
      let buttons = await forButtonValued(buttonName);
      if (Array.isArray(buttons) && buttons.length)
        return buttons[0];

      debug('Not found');

      debug('Trying to find button containing text %s', buttonName);
      buttons = await forButtonLabelled(buttonName);
      if (Array.isArray(buttons) && buttons.length)
        return buttons[0];

      debug('Not Found');
    });
  };

  function forScript(script) {
    return webdriver.wait(function () {
      return webdriver.executeScript(script);
    });
  };


  /*this.findWithValue = function findWithValue(collection, value) {
    return collection.find(async function(item) {
      let current = await button.getAttribute('value');
      return current === value;
    });
  }*/


  function forButtonValued(value) {
    let cssSelector = `button[value="${value}"], input[type=button][value="${value}"], input[type=submit][value="${value}"]`;
    return webdriver.findElements(By.css(cssSelector));
  };

  function forButtonLabelled(label) {
    return webdriver.findElements(By.xpath('//button[contains(.,"' + label + '")]'));
  };

  function forActionable(actionSequence) {
    return until(function() {
      return actionSequence.perform();
    });
  };

  function ms(millis) {
    return new Promise(function(resolve) {
      setTimeout(resolve, ms);
    });
  };

  return {
    forActionable,
    forButton,
    forButtonLabelled,
    forButtonValued,
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