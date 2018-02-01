import {isntDesignDoc} from './utils/isnt-design-doc';

/**
 * Finds all existing objects in local database.
 *
 * @param  {Function} {OPTIONAL} filter   Function returning `true` for any object
 *                                        to be returned.
 * @param  {String}   {OPTIONAL} prefix   optional id prefix
 * @return {Promise}
 */
export function pleaseFindAll (filter, prefix) {
  const db = this;
  
  let options = {
    include_docs: true
  };

  if (prefix) {
    options.startkey = prefix;
    options.endkey = prefix + '\uffff';
  }

  return db.allDocs(options)
    .then(function (res) {
      let objects = res.rows
        .filter(isntDesignDoc)
        .map(function (row) {
          return row.doc
        });

      return typeof filter === 'function'
        ? objects.filter(filter)
        : objects;
    });
}
