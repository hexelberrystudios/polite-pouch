import {updateOne} from './helpers/update-one';
import {updateMany} from './helpers/update-many';
import {markAsDeleted} from './utils/mark-as-deleted';

/**
 * Removes existing object
 *
 * @param  {Array}           idsOrObjects An array of ids or objects
 * @param  {Object|Function} change       Change properties or function that changes existing object
 * @param  {String}          [prefix]     Optional id prefix
 * @returns {Promise}
 */
export function pleaseRemove (idsOrObjects, change, prefix) {
  const db = this;

  return Array.isArray(idsOrObjects)
    ? updateMany(db, idsOrObjects.map(markAsDeleted.bind(null, change)), null, prefix)
    : updateOne(db, markAsDeleted(change, idsOrObjects), null, prefix);
};
