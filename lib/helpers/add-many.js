import uuid from 'uuid/v5';
import assign from '../utils/assign';
import {addTimestamps} from '../utils/add-timestamps';

/**
 * Adds one object to the local database.
 *
 * @param  {PouchDB}  {REQUIRED} db       Reference to PouchDB
 * @param  {Array}    {REQUIRED} docs     The object to be added to the db
 * @param  {String}   {OPTIONAL} prefix   optional id prefix
 * @return {Promise}
 */
export function addMany (db, docs, prefix) {
  // copy over the objects to be added and add timestamps to them
  docs = docs.map(function (doc) {
    doc = assign({}, doc);
    return addTimestamps(doc);
  });

  if (prefix) {
    docs.forEach(function (doc) {
      doc._id = prefix + (doc._id || uuid());
    });
  }
  
  // make sure we make a bulk call to CouchDB for performance
  return db.bulkDocs(docs)
    .then(function (responses) {
      // check through all the responses
      return responses.map(function (response, i) {
        let conflict;
        // found an error/conflict. note it and move on.
        if (response instanceof Error) {
          if (response.status === 409) {
            conflict = new Error('Object with id "' + docs[i]._id + '" already exists');
            conflict.name = 'Conflict';
            conflict.status = 409;
            
            return conflict;
          } else {
            return response;
          }
        }
  
        // make sure to include the latest id and revision information
        docs[i]._id = response.id;
        docs[i]._rev = response.rev;
        return docs[i];
      });
    });
};
