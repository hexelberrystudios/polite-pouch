import {findOne} from './helpers/find-one';
import {findMany} from './helpers/find-many';

/**
 * finds existing object in local database
 *
 * @param  {Array}   {REQUIRED} idsOrObjects An array of ids or objects
 * @param  {String}  {OPTIONAL} prefix       Optional id prefix
 * @return {Promise}
 */
export function pleaseFind (idsOrObjects, prefix) {
  const db = this;

  return Array.isArray(idsOrObjects)
    ? findMany(db, idsOrObjects, prefix)
    : findOne(db, idsOrObjects, prefix);
};
