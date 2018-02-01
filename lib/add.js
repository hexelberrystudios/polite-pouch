import {addOne} from './helpers/add-one';
import {addMany} from './helpers/add-many';

/**
 * Adds one or multiple objects to the local database.
 *
 * @param  {PouchDB}      db       Reference to PouchDB
 * @param  {Object|Array} objects  The object or objects to be added to the db
 * @param  {String}       [prefix] Optional id prefix
 * @returns {Promise}
 */
export function pleaseAdd (objects, prefix) {
  const db = this;
  
  return Array.isArray(objects)
    ? addMany(db, objects, prefix)
    : addOne(db, objects, prefix);
};
