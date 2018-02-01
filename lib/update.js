import {updateOne} from './helpers/update-one';
import {updateMany} from './helpers/update-many';

/**
 * Updates existing object.
 * 
 * @param  {Array}           idsOrObjects An array of ids or objects
 * @param  {Function|Object} change       Changed properties or function that alters passed doc
 * @param  {String}          [prefix]     Optional id prefix
 * @returns {Promise}
 */
export function pleaseUpdate (idsOrObjects, change, prefix) {
  const db = this;

  if (typeof idsOrObjects !== 'object' && !change) {
    return Promise.reject(
      new Error('Must provide change')
    );
  }

  return Array.isArray(idsOrObjects)
    ? updateMany(db, idsOrObjects, change, prefix)
    : updateOne(db, idsOrObjects, change, prefix);
};
