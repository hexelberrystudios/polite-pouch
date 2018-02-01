import {addOne} from './helpers/add-one';
import {addMany} from './helpers/add-many';

/**
 * Adds one or multiple objects to the local database.
 *
 * @param  {PouchDB}      {REQUIRED} db       Reference to PouchDB
 * @param  {Object|Array} {REQUIRED} objects  The object or objects to be added to the db
 * @param  {String}       {OPTIONAL} prefix   optional id prefix
 * @return {Promise}
 */
export function pleaseAdd (objects, prefix) {
  const db = this;
  
  return Array.isArray(objects)
    ? addMany(db, objects, prefix)
    : addOne(db, objects, prefix);
};
