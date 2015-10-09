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

Open **url**

Browse to **url**

Navigate to **url**

### Text Entry

Type **text** into Search

Type **text** into Search Box

Enter **text** into Search

Enter **text** into Search Box

Enter **text** into the Search Box

### Waiting

Wait for text **pattern**

### Clicking

Click on **name** Button

Click **name** Button

### HTML Extraction

Extract HTML into **variable**

Extract HTML as **variable**

Extract all HTML


## Example Script

Open http://www.google.ca/

Enter Hello into Search Box

Click Search Button

Wait for text Hello!
 



