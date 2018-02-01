import assign from '../utils/assign';
import {changeObject} from '../utils/change-object';
import {addTimestamps} from '../utils/add-timestamps';
import {toId} from '../utils/to-id';
import {findMany} from './find-many';

/**
 * Update one object to the local database.
 *
 * @param  {PouchDB}         {REQUIRED} db           Reference to PouchDB
 * @param  {Array}           {REQUIRED} idsOrObjects An array of ids or objects
 * @param  {Function|Object} {REQUIRED} change       Changed properties or function that alters passed doc
 * @param  {String}          {OPTIONAL} prefix       Optional id prefix
 * @return {Promise}
 */
export function updateMany (db, idsOrObjects, change, prefix) {
  let docs;
  let ids = idsOrObjects.map(function (doc) {
    let id = toId(doc);

    if (prefix && id.substr(0, prefix.length) !== prefix) {
      id = prefix + id;
    }

    return id;
  });

  return findMany(db, ids, prefix)
    .then(function (docs) {
      if (change) {
        return docs.map(function (doc) {
          if (doc instanceof Error) {
            return doc;
          } else {
            return changeObject(change, doc);
          }
        });
      }
  
      return docs.map(function (doc, index) {
        const passedDoc = idsOrObjects[index];
        
        if (doc instanceof Error) {
          return doc;
        } else if (typeof passedDoc !== 'object') {
          return Promise.reject('Document must be a JSON object');
        } else {
          return assign(doc, passedDoc, { _id: doc._id, _rev: doc._rev });
        }
      });
    })
    .then(function (_docs) {
      let validObjects;
      docs = _docs;
      
      validObjects = docs.filter(function (doc) {
        return !(doc instanceof Error);
      });
      
      validObjects.forEach(addTimestamps);
      
      return db.bulkDocs(validObjects);
    })
    .then(function (responses) {
      responses.forEach(function (response) {
        const index = ids.indexOf(response.id);
        
        docs[index]._rev = response.rev;
      });
  
      return docs;
    });
};
