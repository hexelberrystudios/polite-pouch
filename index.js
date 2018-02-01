import {pleaseAdd} from './lib/add';
import {pleaseClear} from './lib/clear';
import {pleaseFindAll} from './lib/find-all';
import {pleaseFind} from './lib/find';
import {pleaseRemoveAll} from './lib/remove-all';
import {pleaseRemove} from './lib/remove';
import {pleaseUpdate} from './lib/update';


/**
 * This is a thin wrapper over the PouchDB API to automatically
 * handle id and timestamps.
 */
export const politePouch = {
  pleaseAdd,
  pleaseClear,
  pleaseFindAll,
  pleaseFind,
  pleaseRemoveAll,
  pleaseRemove,
  pleaseUpdate
};

/*

Example:
var politePouch = { pleaseFindAll : function() { ... } };

var PouchDB = require('pouchdb').plugin(politePouch);

var db = new PouchDB('foobar');
db.pleaseFindAll(); // returns all
*/
