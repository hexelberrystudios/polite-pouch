# polite-pouch
A thin layer over PouchDB to make automatically adding ids and timestamps easier.
 - 8KB minified

## Usage

```javascript
import PouchDB from 'PouchDB';
import {politePouch} from 'politePouch';

PouchDB.plugin(politePouch);

const db = new PouchDB('foobar');
db.pleaseFindAll(); // returns all data
```

## Installation

    npm install --save polite-pouch

## Documentation

[API](API.md)

## License

MIT License

Copyright (c) 2018 Hexelberry Studios
