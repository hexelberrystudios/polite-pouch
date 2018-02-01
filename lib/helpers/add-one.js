import assign from '../utils/assign';
import uuid from 'uuid/v5';
import {addTimestamps} from '../utils/add-timestamps';

/**
 * Adds one object to the local database.
 * @private
 * 
 * @param  {PouchDB}  db       Reference to PouchDB
 * @param  {Object}   doc      The object to be added to the db
 * @param  {String}   [prefix] Optional id prefix
 * @returns {Promise}
 */
export function addOne (db, doc, prefix) {
  if (typeof doc !== 'object') {
    return Promise.reject('Document must be a JSON object');
  }

  // copy document, to make sure we don't affect the original
  doc = assign({}, doc);

  // generate an id if we don't already have one
  if (!doc._id) {
    doc._id = uuid();
  }

  // prefixes can be added to ids to significantly reduce the possibility for collision
  if (prefix) {
    doc._id = prefix + doc._id;
  }

  // add createdAt/updatedAt timestamps
  doc = addTimestamps(doc);
  return db.put(doc)
    .then(function (response) {
      // make sure to include the latest id and revision information
      doc._id = response.id;
      doc._rev = response.rev;
      
      return doc;
    })
    .catch(function (error) {
      let conflict;
      
      if (error.status === 409) {
        conflict = new Error('Object with id "' + doc._id + '" already exists');
        conflict.name = 'Conflict';
        conflict.status = 409;
        
        throw conflict;
      } else {
        throw error;
      }
    });
};
