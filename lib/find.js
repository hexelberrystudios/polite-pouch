import {findOne} from './helpers/find-one';
import {findMany} from './helpers/find-many';

/**
 * finds existing object in local database
 *
 * @param  {Array}   idsOrObjects An array of ids or objects
 * @param  {String}  [prefix]     Optional id prefix
 * @returns {Promise}
 */
export function pleaseFind (idsOrObjects, prefix) {
  const db = this;

  return Array.isArray(idsOrObjects)
    ? findMany(db, idsOrObjects, prefix)
    : findOne(db, idsOrObjects, prefix);
};
