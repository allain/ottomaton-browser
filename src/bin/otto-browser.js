#!/usr/bin/env node

var ottomatonBrowserPath = require.resolve('..');

// Inject browser actions into the otto context
process.argv.splice(2, 0, ottomatonBrowserPath);

require('ottomaton/lib/bin/otto');