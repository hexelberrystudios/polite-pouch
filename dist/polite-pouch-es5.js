var politePouch = (function (exports,uuid) {
'use strict';

uuid = uuid && uuid.hasOwnProperty('default') ? uuid['default'] : uuid;

if (typeof Object.assign !== 'function') {
  // lite Object.assign polyfill based on
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
  Object.assign = function (target) {
    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];

      if (nextSource != null) {
        // Skip over if undefined or null
        for (var nextKey in nextSource) {
          // Avoid bugs when hasOwnProperty is shadowed
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

var assign = Object.assign;

/**
 * Generates the current date time.
 * 
 * @returns The current date time as a string.
 */
function now() {
  return new Date().toISOString();
}

function addTimestamps(doc) {
  if (doc.createdAt) {
    doc.updatedAt = now();
  } else {
    doc.createdAt = now();
  }

  if (doc._deleted) {
    doc.deletedAt = doc.deletedAt || doc.updatedAt;
  }

  return doc;
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

/**
 * Adds one object to the local database.
 *
 * @param  {PouchDB}  {REQUIRED} db       Reference to PouchDB
 * @param  {Object}   {REQUIRED} doc      The object to be added to the db
 * @param  {String}   {OPTIONAL} prefix   Optional id prefix
 * @return {Promise}
 */
function addOne(db, doc, prefix) {
  if ((typeof doc === 'undefined' ? 'undefined' : _typeof(doc)) !== 'object') {
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
  return db.put(doc).then(function (response) {
    // make sure to include the latest id and revision information
    doc._id = response.id;
    doc._rev = response.rev;

    return doc;
  }).catch(function (error) {
    var conflict = void 0;

    if (error.status === 409) {
      conflict = new Error('Object with id "' + doc._id + '" already exists');
      conflict.name = 'Conflict';
      conflict.status = 409;

      throw conflict;
    } else {
      throw error;
    }
  });
}

/**
 * Adds one object to the local database.
 *
 * @param  {PouchDB}  {REQUIRED} db       Reference to PouchDB
 * @param  {Array}    {REQUIRED} docs     The object to be added to the db
 * @param  {String}   {OPTIONAL} prefix   Optional id prefix
 * @return {Promise}
 */
function addMany(db, docs, prefix) {
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
  return db.bulkDocs(docs).then(function (responses) {
    // check through all the responses
    return responses.map(function (response, i) {
      var conflict = void 0;
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
}

/**
 * Adds one or multiple objects to the local database.
 *
 * @param  {PouchDB}      {REQUIRED} db       Reference to PouchDB
 * @param  {Object|Array} {REQUIRED} objects  The object or objects to be added to the db
 * @param  {String}       {OPTIONAL} prefix   Optional id prefix
 * @return {Promise}
 */
function pleaseAdd(objects, prefix) {
  var db = this;

  return Array.isArray(objects) ? addMany(db, objects, prefix) : addOne(db, objects, prefix);
}

/**
 * Destroys db.
 */
function pleaseClear() {
  var db = this;

  return db.destroy();
}

/**
 * Checks for a design doc, so we can filter out docs that shouldn't return in *All methods
 */
function isntDesignDoc(row) {
  return row.id.match(/^_design/) === null;
}

/**
 * Finds all existing objects in local database.
 *
 * @param  {Function} {OPTIONAL} filter   Function returning `true` for any object
 *                                        to be returned.
 * @param  {String}   {OPTIONAL} prefix   Optional id prefix
 * @return {Promise}
 */
function pleaseFindAll(filter, prefix) {
  var db = this;

  var options = {
    include_docs: true
  };

  if (prefix) {
    options.startkey = prefix;
    options.endkey = prefix + '\uFFFF';
  }

  return db.allDocs(options).then(function (res) {
    var objects = res.rows.filter(isntDesignDoc).map(function (row) {
      return row.doc;
    });

    return typeof filter === 'function' ? objects.filter(filter) : objects;
  });
}

/**
 * Evaluates the given parameter and retrieves an id from it.
 * @param {*} idOrObject This will either be an object with an id, or an id.
 * 
 * @returns {Number} an ID.
 */
function toId(idOrObject) {
  return (typeof idOrObject === 'undefined' ? 'undefined' : _typeof(idOrObject)) === 'object' ? idOrObject._id : idOrObject;
}

/**
 * Returns the object matching the given id or object.
 *
 * @param  {PouchDB}       {REQUIRED} db         Reference to PouchDB
 * @param  {String|Object} {REQUIRED} idOrObject An array of ids or objects
 * @param  {String}        {OPTIONAL} prefix     Optional id prefix
 * @return {Promise}
 */
function findOne(db, idOrObject, prefix) {
  var id = toId(idOrObject);

  // add prefix if it's not included in the id already
  if (prefix && id.substr(0, prefix.length) !== prefix) {
    id = prefix + id;
  }

  return db.get(id).catch(function (error) {
    var missing = void 0;

    if (error.status === 404) {
      missing = new Error('Object with id "' + id + '" is missing');
      missing.name = 'Not found';
      missing.status = 404;
      throw missing;
    } else {
      throw error;
    }
  });
}

/**
 * Returns all objects matching the given ids or objects.
 *
 * @param  {PouchDB}  {REQUIRED} db           Reference to PouchDB
 * @param  {Array}    {REQUIRED} idsOrObjects An array of ids or objects
 * @param  {String}   {OPTIONAL} prefix       Optional id prefix
 * @return {Promise}
 */
function findMany(db, idsOrObjects, prefix) {
  var ids = idsOrObjects.map(toId);

  // add prefix if it's not included in the id already
  if (prefix) {
    ids = ids.map(function (id) {
      return id.substr(0, prefix.length) === prefix ? id : prefix + id;
    });
  }

  return db.allDocs({ keys: ids, include_docs: true }).then(function (response) {
    // gather a hashmap of ids
    var docsById = response.rows.reduce(function (map, row) {
      map[row.id] = row.doc;
      return map;
    }, {});

    // for each requested id, use foundMap to get the document with the matching id
    var docs = ids.map(function (id) {
      var doc = docsById[id];

      if (doc) {
        return doc;
      } else {
        var missing = new Error('Object with id "' + id + '" is missing');

        missing.name = 'Not found';
        missing.status = 404;

        return missing;
      }
    });

    return docs;
  });
}

/**
 * finds existing object in local database
 *
 * @param  {Array}   {REQUIRED} idsOrObjects An array of ids or objects
 * @param  {String}  {OPTIONAL} prefix       Optional id prefix
 * @return {Promise}
 */
function pleaseFind(idsOrObjects, prefix) {
  var db = this;

  return Array.isArray(idsOrObjects) ? findMany(db, idsOrObjects, prefix) : findOne(db, idsOrObjects, prefix);
}

/**
 * Removes existing object
 *
 * @param  {PouchDB}  {REQUIRED} db     Reference to PouchDB
 * @param  {Function} {REQUIRED} filter Function returning `true` for any doc to be removed.
 * @param  {String}   {OPTIONAL} prefix Optional id prefix
 * @return {Promise}
 */
function pleaseRemoveAll(filter, prefix) {
  var docs = void 0;
  var db = this;
  var options = {
    include_docs: true
  };

  if (prefix) {
    options.startkey = prefix;
    options.endkey = prefix + '\uFFFF';
  }

  return db.allDocs(options).then(function (res) {
    docs = res.rows.filter(isntDesignDoc).map(function (row) {
      return row.doc;
    });

    if (typeof filter === 'function') {
      docs = docs.filter(filter);
    }

    return docs.map(function (doc) {
      doc._deleted = true;
      return addTimestamps(doc);
    });
  }).then(db.bulkDocs.bind(db)).then(function (results) {
    return results.map(function (result, i) {
      docs[i]._rev = result.rev;
      return docs[i];
    });
  });
}

/**
  * Change object either by passing changed properties
  * as an object, or by passing a change function that
  * manipulates the passed object directly.
  **/
function changeObject(change, object) {
  if ((typeof change === 'undefined' ? 'undefined' : _typeof(change)) === 'object') {
    assign(object, change);
  } else {
    change(object);
  }

  return object;
}

/**
 * Update one object to the local database.
 *
 * @param  {PouchDB}         {REQUIRED} db         Reference to PouchDB
 * @param  {String|Object}   {REQUIRED} idOrObject An id or object
 * @param  {Function|Object} {REQUIRED} change     Changed properties or function that alters passed doc
 * @param  {String}          {OPTIONAL} prefix     Optional id prefix
 * @return {Promise}
 */
function updateOne(db, idOrDoc, change, prefix) {
  var doc = void 0;

  if (typeof idOrDoc === 'string' && !change) {
    return Promise.reject('Document must be a JSON object');
  }

  return findOne(db, idOrDoc, prefix).then(function (doc) {
    if (!change) {
      return assign(doc, idOrDoc, { _id: doc._id, _rev: doc._rev });
    } else {
      return changeObject(change, doc);
    }
  }).then(function (_doc) {
    doc = _doc;
    return db.put(addTimestamps(doc));
  }).then(function (response) {
    doc._rev = response.rev;
    return doc;
  });
}

/**
 * Update one object to the local database.
 *
 * @param  {PouchDB}         {REQUIRED} db           Reference to PouchDB
 * @param  {Array}           {REQUIRED} idsOrObjects An array of ids or objects
 * @param  {Function|Object} {REQUIRED} change       Changed properties or function that alters passed doc
 * @param  {String}          {OPTIONAL} prefix       Optional id prefix
 * @return {Promise}
 */
function updateMany(db, idsOrObjects, change, prefix) {
  var docs = void 0;
  var ids = idsOrObjects.map(function (doc) {
    var id = toId(doc);

    if (prefix && id.substr(0, prefix.length) !== prefix) {
      id = prefix + id;
    }

    return id;
  });

  return findMany(db, ids, prefix).then(function (docs) {
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
      var passedDoc = idsOrObjects[index];

      if (doc instanceof Error) {
        return doc;
      } else if ((typeof passedDoc === 'undefined' ? 'undefined' : _typeof(passedDoc)) !== 'object') {
        return Promise.reject('Document must be a JSON object');
      } else {
        return assign(doc, passedDoc, { _id: doc._id, _rev: doc._rev });
      }
    });
  }).then(function (_docs) {
    var validObjects = void 0;
    docs = _docs;

    validObjects = docs.filter(function (doc) {
      return !(doc instanceof Error);
    });

    validObjects.forEach(addTimestamps);

    return db.bulkDocs(validObjects);
  }).then(function (responses) {
    responses.forEach(function (response) {
      var index = ids.indexOf(response.id);

      docs[index]._rev = response.rev;
    });

    return docs;
  });
}

/**
 * Normalizes objectOrId, applies changes if any, and mark as deleted
 * 
 * @param  {Function|Object} {REQUIRED} change     Changed properties or function that alters passed doc
 * @param  {String|Object}   {REQUIRED} idOrObject An id or object
 */
function markAsDeleted(change, idOrObject) {
  var object = typeof idOrObject === 'string' ? { _id: idOrObject } : idOrObject;

  if (change) {
    changeObject(change, object);
  }

  return assign({ _deleted: true }, object);
}

/**
 * Removes existing object
 *
 * @param  {Array}           {REQUIRED} idsOrObjects An array of ids or objects
 * @param  {Object|Function} {OPTIONAL} change       Change properties or function that changes existing object
 * @param  {String}          {OPTIONAL} prefix       Optional id prefix
 * @return {Promise}
 */
function pleaseRemove(idsOrObjects, change, prefix) {
  var db = this;

  return Array.isArray(idsOrObjects) ? updateMany(db, idsOrObjects.map(markAsDeleted.bind(null, change)), null, prefix) : updateOne(db, markAsDeleted(change, idsOrObjects), null, prefix);
}

/**
 * Updates existing object.
 * 
 * @param  {Array}           {REQUIRED} idsOrObjects An array of ids or objects
 * @param  {Function|Object} {OPTIONAL} change       Changed properties or function that alters passed doc
 * @param  {String}          {OPTIONAL} prefix       Optional id prefix
 * @return {Promise}
 */
function pleaseUpdate(idsOrObjects, change, prefix) {
  var db = this;

  if ((typeof idsOrObjects === 'undefined' ? 'undefined' : _typeof(idsOrObjects)) !== 'object' && !change) {
    return Promise.reject(new Error('Must provide change'));
  }

  return Array.isArray(idsOrObjects) ? updateMany(db, idsOrObjects, change, prefix) : updateOne(db, idsOrObjects, change, prefix);
}

/**
 * This is a thin wrapper over the PouchDB API to automatically
 * handle id and timestamps.
 */
var politePouch = {
  pleaseAdd: pleaseAdd,
  pleaseClear: pleaseClear,
  pleaseFindAll: pleaseFindAll,
  pleaseFind: pleaseFind,
  pleaseRemoveAll: pleaseRemoveAll,
  pleaseRemove: pleaseRemove,
  pleaseUpdate: pleaseUpdate
};

/*

Example:
var politePouch = { pleaseFindAll : function() { ... } };

var PouchDB = require('pouchdb').plugin(politePouch);

var db = new PouchDB('foobar');
db.pleaseFindAll(); // returns all
*/

exports.politePouch = politePouch;

return exports;

}({},uuid/v5));
