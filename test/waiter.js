var test = require('blue-tape');

var debug = require('debug')('test:waiter');

var Ottomaton = require('ottomaton');

test('waiter - is exposed in action', function(t) {
  Ottomaton().register(require('../lib/.')).register('test', function() {
    t.ok(this.ottomaton.extraState.wait, 'waiter is exposed in ottomaton extra state');
    t.ok(this.wait, 'waiter is exposed');
    t.equal(typeof this.wait.until, 'function', 'waiter has proper ducktype');
    t.end();
  }).run('test').catch(t.end);
});

test('waiter - until returns when predicate returns true', function(t) {
  var waits = 0;
  return new Ottomaton().register(require('../lib/.')).register('test', function() {
    return this.wait.until(function() {
      waits ++;

      return waits === 5;
    }, 1000, 100);
  }).run('test');
});

test('waiter - until fails if predicate does not return truthy in timeout', function(t) {
  return new Ottomaton().register(require('../lib/.')).register('test', function() {
    return this.wait.until(function() {
      debug('predicate running');
      return false;
    }, 100);
  }).run('test').catch(err => {
    t.ok(err, 'expected error');
  })
});

test('waiter - until never calls predicate faster then interal', function(t) {
  var INTERVAL = 50;
  return new Ottomaton().register(require('../lib/.')).register('test', function() {
    var lastCall = null;
    var waits = 0;
    return this.wait.until(function() {
      if (lastCall !== null) {
        t.ok(Date.now() - lastCall >= INTERVAL, 'predicate calls too quick');
      }

      lastCall = Date.now();

      return (++ waits) === 5;
    }, 10000, 50);
  }).run('test');
});