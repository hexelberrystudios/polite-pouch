import assign from './assign'

/**
  * Change object either by passing changed properties
  * as an object, or by passing a change function that
  * manipulates the passed object directly.
  * @private
  * 
  * @param {Object or Function} change The catalyst for changing the given object.
  * @param {Object}             object The object to be updated.
  * 
  * @returns The updated object.
  **/
export function changeObject (change, object) {
  if (typeof change === 'object') {
    assign(object, change);
  } else {
    change(object);
  }

  return object
};
