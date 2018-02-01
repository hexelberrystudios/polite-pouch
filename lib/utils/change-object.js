import assign from './assign'

/**
  * Change object either by passing changed properties
  * as an object, or by passing a change function that
  * manipulates the passed object directly.
  **/
export function changeObject (change, object) {
  if (typeof change === 'object') {
    assign(object, change);
  } else {
    change(object);
  }

  return object
};
