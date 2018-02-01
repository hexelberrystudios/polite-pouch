/**
 * Evaluates the given parameter and retrieves an id from it.
 * @param {*} idOrObject This will either be an object with an id, or an id.
 * 
 * @returns {Number} an ID.
 */
export function toId (idOrObject) {
  return typeof idOrObject === 'object' ? idOrObject._id : idOrObject;
};
