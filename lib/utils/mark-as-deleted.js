import assign from './assign';
import {changeObject} from './change-object';

/**
 * Normalizes objectOrId, applies changes if any, and mark as deleted
 * @private
 * 
 * @param  {Function|Object} change     Changed properties or function that alters passed doc
 * @param  {String|Object}   idOrObject An id or object
 * 
 * @returns The updated object.
 */
export function markAsDeleted (change, idOrObject) {
  let object = typeof idOrObject === 'string' ? { _id: idOrObject } : idOrObject;

  if (change) {
    changeObject(change, object);
  }

  return assign({ _deleted: true }, object);
};
