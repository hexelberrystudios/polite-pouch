import {toId} from '../utils/to-id';

/**
 * Returns all objects matching the given ids or objects.
 * @private
 * 
 * @param  {PouchDB}  db           Reference to PouchDB
 * @param  {Array}    idsOrObjects An array of ids or objects
 * @param  {String}   [prefix]     Optional id prefix
 * @returns {Promise}
 */
export function findMany (db, idsOrObjects, prefix) {
  let ids = idsOrObjects.map(toId);

  // add prefix if it's not included in the id already
  if (prefix) {
    ids = ids.map(function (id) {
      return id.substr(0, prefix.length) === prefix ? id : prefix + id;
    });
  }

  return db.allDocs({ keys: ids, include_docs: true })
    .then(function (response) {
      // gather a hashmap of ids
      const docsById = response.rows.reduce(function (map, row) {
        map[row.id] = row.doc;
        return map;
      }, {});

      // for each requested id, use foundMap to get the document with the matching id
      const docs = ids.map(function (id) {
        const doc = docsById[id];
        
        if (doc) {
          return doc;
        } else {
          const missing = new Error('Object with id "' + id + '" is missing');
          
          missing.name = 'Not found';
          missing.status = 404;

          return missing;
        }
      });

      return docs;
    });
};
