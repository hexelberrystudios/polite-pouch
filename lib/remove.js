import {updateOne} from './helpers/update-one';
import {updateMany} from './helpers/update-many';
import {markAsDeleted} from './utils/mark-as-deleted';

/**
 * Removes existing object
 *
 * @param  {Array}           {REQUIRED} idsOrObjects An array of ids or objects
 * @param  {Object|Function} {OPTIONAL} change       Change properties or function that changes existing object
 * @param  {String}          {OPTIONAL} prefix       Optional id prefix
 * @return {Promise}
 */
export function pleaseRemove (idsOrObjects, change, prefix) {
  const db = this;

  return Array.isArray(idsOrObjects)
    ? updateMany(db, idsOrObjects.map(markAsDeleted.bind(null, change)), null, prefix)
    : updateOne(db, markAsDeleted(change, idsOrObjects), null, prefix);
};
