# ottomaton-browser

A library of browser automation actions for use with ottomaton.

## Installation

```bash
npm install ottomaton-browser
```

## Usage

```js

var Ottomaton = require('ottomaton');

var otto = Ottomaton().register(require('ottomaton-browser'));

otto.run([
  'Open http://www.google.ca/',
  'Extract HTML as landing',
  'Enter Hello into Search Box',
  'Click Search Button',
  'Wait for text Hello!'
]).then(function(result) {
  console.log('HTML of google landing page: ');
  console.log(result.landing);
  
  console.log('HTML of last page browser viewed:');
  console.log(result.html);
});
```

## Provided Actions

### Navigation
Open **URL**
Browse to **URL**
Navigate to **URL**

### Text Entry

Type **TEXT** into Search

Type **TEXT** into Search Box

Enter **TEXT** into Search

Enter **TEXT** into Search Box

### Waiting

Wait for text **PATTERN**

### Clicking

Click on **NAME** Button

Click **NAME** Button

### HTML Extraction

Extract HTML into **VARIABLE**

Extract HTML as **VARIABLE**

Extract all HTML

## Example Script

Open http://www.google.ca/

Enter Hello into Search Box

Click Search Button

Wait for text Hello!
 



