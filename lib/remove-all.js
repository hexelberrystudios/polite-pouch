import {isntDesignDoc} from './utils/isnt-design-doc';
import {addTimestamps} from './utils/add-timestamps';

/**
 * Removes existing object
 *
 * @param  {PouchDB}  db       Reference to PouchDB
 * @param  {Function} filter   Function returning `true` for any doc to be removed.
 * @param  {String}   [prefix] Optional id prefix
 * @returns {Promise}
 */
export function pleaseRemoveAll (filter, prefix) {
  let docs;
  const db = this;
  const options = {
    include_docs: true
  };

  if (prefix) {
    options.startkey = prefix;
    options.endkey = prefix + '\uffff';
  }

  return db.allDocs(options)
    .then(function (res) {
      docs = res.rows
        .filter(isntDesignDoc)
        .map(function (row) {
          return row.doc;
        });

      if (typeof filter === 'function') {
        docs = docs.filter(filter);
      }

      return docs.map(function (doc) {
        doc._deleted = true;
        return addTimestamps(doc);
      });
    })
    .then(db.bulkDocs.bind(db))
    .then(function (results) {
      return results.map(function (result, i) {
        docs[i]._rev = result.rev;
        return docs[i];
      });
    });
};
