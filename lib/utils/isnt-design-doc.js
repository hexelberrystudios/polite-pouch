/**
 * Checks for a design doc, so we can filter out docs that shouldn't return in *All methods
 * @private
 * 
 * @param {Object} row A PouchDB row object.
 * 
 * @returns {Boolean} True if the object is not a design doc.
 */
export function isntDesignDoc (row) {
  return row.id.match(/^_design/) === null;
};
