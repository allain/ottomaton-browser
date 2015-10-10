import { Action } from 'ottomaton';

import selenium from 'selenium-webdriver';

const By = selenium.By;

export default async function (ottomaton) {
  const webdriver = new selenium.Builder().withCapabilities(selenium.Capabilities.chrome()).build();

  // Wait tillt he browser is actually loaded
  const handle = await webdriver.getWindowHandle();

  webdriver.By = selenium.By;

  ottomaton.webdriver = webdriver;

  return [
    Action([
      /^Open (https?:\/\/[^\s]*)$/i,
      /^Browse to (https?:\/\/[^\s]*)$/i,
      /^Navigate to (https?:\/\/[^\s]*)$/i
    ], url => webdriver.get(url)),

    Action([
      /^Type (.+) into(?: the)? Search(?: Box)?$/,
      /^Enter (.+) into(?: the)? Search(?: Box)?$/
    ], async function(text) {
      let searchBox = await webdriver.findElement(By.name('q'));
      if (!searchBox)
        throw new Error('Search Box not found');

      searchBox.sendKeys(text);
    }),

    Action([
      /^Wait for text (.*)$/i
    ], function(pattern) {
      pattern = pattern.trim();
      return webdriver.wait(async function () {
        var text = await webdriver.executeScript('return document.querySelector("html").outerText');

        return text && text.indexOf(pattern) !== -1;
      });
    }),

    Action([
      /^Click on (.+) Button/i,
      /^Click (.+) Button/i
    ], async function (buttonName) {
      let buttons = await webdriver.findElements(By.css('button, input[type=button], input[type=submit]'));

      let button = findWithValue(buttons, buttonName);
      if (!button)
        throw new Error('Button Not Found: ' + buttonName);

      return button.click();
    }),

    Action([
      /^Type (.+) into (.+) box$/i,
      /^Type (.+) into (.+)$/i
    ], async function(text, field) {
      let input = await webdriver.findElement(By.xpath('//input[contains(@name,"' + field + '")]'));
      if (!input)
        throw new Error('Text Field Not Found: ' + field);

      return input.sendKeys(text);
    }),

    Action([
      /^Click on (.+) Link/i,
      /^Click (.+) Link/i
    ], async function(linkText) {
      var links = await webdriver.findElements(By.xpath('//a[contains(.,"' + linkText + '")]'));

      var link = links[0];
      if (!link)
        throw new Error('Link Not Found: ' + linkText);

      // Seems to wait till the sreen is not in transition (dialog opening, etc)
      await link.isDisplayed();

      return link.click();
    }),

    Action([
      /^Extract HTML into (.*)$/i,
      /^Extract HTML as (.*)$/i
    ], function (target) {
      return extractHTML.call(this, target);
    }),

    Action(/^Extract(?: All) HTML$/i, 'Extract HTML into html'),

    Action(Action.FINISH,  async function() {
      await extractHTML.call(this, 'html');

      return webdriver.quit();
    })
  ];

  async function extractHTML(target) {
    var html = await webdriver.executeScript('return document.querySelector("html").outerHTML');
    this[target] = html;
  }


  function findWithValue(collection, value) {
    return collection.find(async function(item) {
      let current = await button.getAttribute('value');
      return current === value;
    });
  }
};
