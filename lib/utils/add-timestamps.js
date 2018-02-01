import {now} from './now';

export function addTimestamps (doc) {
  if (doc.createdAt) {
    doc.updatedAt = now()
  } else {
    doc.createdAt = now()
  }
  
  if (doc._deleted) {
    doc.deletedAt = doc.deletedAt || doc.updatedAt
  }

  return doc
}

export default addTimestamps
