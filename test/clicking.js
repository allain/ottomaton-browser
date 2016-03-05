var test = require('blue-tape');
var path = require('path');
var Ottomaton = require('ottomaton');
var debug = require('debug')('clicking');

test('clicking - all kinds of buttons supported', function(t) {
  return Ottomaton().register(require('../lib/.')).run([
    'Open file://' + path.resolve(__dirname, 'fixtures/page1.html'),
    'Click button1 Button',
    'Wait for Text button1 clicked',
    'Click button2 Button',
    'Wait for Text button2 clicked',
    'Click button3 Button',
    'Wait for Text button3 clicked',
    'Click //*[@id="button4"] Button',
    'Wait for Text button4 clicked'
  ]).then(function(result) {
    for (var i=1; i<=4; i++) {
      t.notEqual(result.html.indexOf('button' + i + ' clicked'), -1, 'button' + i + ' clicked found');
    }
  });
});

test('clicking - checking checkbox works', function(t) {
  return Ottomaton().register(require('../lib/.')).run([
    'Open file://' + path.resolve(__dirname, 'fixtures/page1.html'),
    'Check Checkbox check1',
    'Wait for Text check1 clicked',
    'Check Checkbox offscreen-check2',
    'Wait for Text offscreen-check2 clicked'
  ]).catch(err => {
      t.fail(err.stack || err)
  })
});

test('clicking - on missing buttons times out', function(t) {
  Ottomaton({defaultTimeout: 1000}).register(require('../lib/.')).run([
    'Open file://' + path.resolve(__dirname, 'fixtures/page1.html'),
    'Click missing1 Button',
  ]).then(t.end, err => {
    t.equal(err.message, 'timeout');
    t.end();
  });
});

test.skip('clicking - on disabled button times out', function(t) {
  return Ottomaton({defaultTimeout: 1000}).register(require('../lib/.')).run([
    'Open file://' + path.resolve(__dirname, 'fixtures/page1.html'),
    'Click disabled1 Button',
  ]).then(function() {
    t.fail('did not timeout');
  }, err => {
    t.equal(err.message, 'timeout');
  });
});