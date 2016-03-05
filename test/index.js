var test = require('blue-tape');
var path = require('path');
var Ottomaton = require('ottomaton');
var Action = Ottomaton.Action;

var OpenPage1 = 'Open file://' + path.resolve(__dirname, 'fixtures/page1.html');

require('../lib/.');

test('exports something that can be prepared to Actions', function(t) {
  var otto = Ottomaton({ headless: true })
    .register(require('../lib/.'))

  return Action.prepareActions(otto.registrations).then(actions => {
    t.ok(Array.isArray(actions))
    actions.forEach(action => {
      console.dir(action)
      t.ok(action instanceof Action, 'all prepared actions should be of type Action')
    })
  })
})

test('collects html of last page on FINISH', function (t) {
  var state = {};
  return Ottomaton({ headless: true })
    .register(require('../lib/.')).run([
      OpenPage1
    ], state).then(function (result) {
      t.equal(result, state);
      t.equal(typeof result.html, 'string');
    })
});

test('can extract html as a prop', function (t) {
  return Ottomaton({ headless: true }).register(require('../lib/.')).run([
    OpenPage1,
    'Extract HTML as page1'
  ]).then(function (result) {
    t.ok(result.page1.indexOf('Page 1') !== -1, 'page should contain Page 1');
  });
});

test('Supports Form Submission', function (t) {
  return Ottomaton({ headless: true }).register(require('../lib/.')).run([
    'Open http://www.google.ca',
    'Enter Hello into Search Box',
    'Click Search Button',
    'Wait for text Hello'
  ]).then(function (result) {
    t.ok(result.html.indexOf('HELLO') !== -1, 'page should contain HELLO');
  });
});

test('Supports typing in fields that will eventually exist', function (t) {
  return Ottomaton({ headless: true }).register(require('../lib/.')).run([
    OpenPage1,
    'Type Hello into delayed box'
  ]);
});