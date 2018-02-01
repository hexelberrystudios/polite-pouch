/**
 * Destroys the db.
 */
export function pleaseClear () {
  const db = this;

  return db.destroy();
};
