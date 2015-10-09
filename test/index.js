var test = require('blue-tape');
var Ottomaton = require('ottomaton');

test('collects html of last page on FINISH', function(t) {
  return Ottomaton().register(require('..')).run([
    'Open http://www.google.ca/'
  ]).then(function(result) {
    t.ok(result.html.indexOf('Google') !== -1, 'page should contain Google');
  });
});

test('Can Open Url and Read Page', function(t) {
  return Ottomaton().register(require('..')).run([
    'Open http://www.google.ca/',
    'Extract HTML as page1'
  ]).then(function(result) {
    t.ok(result.page1.indexOf('Google') !== -1, 'page should contain Google');
  });
});

test('Supports Form Submission', function(t) {
  return Ottomaton().register(require('..')).run([
    'Open http://www.google.ca/',
    'Enter Hello into Search Box',
    'Click Search Button',
    'Wait for text Hello!'
  ]).then(function(result) {
    t.ok(result.html.indexOf('HELLO!') !== -1, 'page should contain HELLO!');
  });
});
