import assign from '../utils/assign';
import {addTimestamps} from '../utils/add-timestamps';
import {findOne} from './find-one';
import {changeObject} from '../utils/change-object';

/**
 * Update one object to the local database.
 *
 * @param  {PouchDB}         {REQUIRED} db         Reference to PouchDB
 * @param  {String|Object}   {REQUIRED} idOrObject An id or object
 * @param  {Function|Object} {REQUIRED} change     Changed properties or function that alters passed doc
 * @param  {String}          {OPTIONAL} prefix     Optional id prefix
 * @return {Promise}
 */
export function updateOne (db, idOrDoc, change, prefix) {
  let doc;

  if (typeof idOrDoc === 'string' && !change) {
    return Promise.reject('Document must be a JSON object');
  }

  return findOne(db, idOrDoc, prefix)
    .then(function (doc) {
      if (!change) {
        return assign(doc, idOrDoc, { _id: doc._id, _rev: doc._rev });
      } else {
        return changeObject(change, doc);
      }
    })
    .then(function (_doc) {
      doc = _doc;
      return db.put(addTimestamps(doc));
    })
    .then(function (response) {
      doc._rev = response.rev;
      return doc;
    });
};
