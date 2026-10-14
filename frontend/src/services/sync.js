import { authAPI, productsAPI } from '../api';

const responseData = (response) => response.data;

export async function syncUpdate(table, id, fields) {
  if (table === 'products') {
    return responseData(await productsAPI.update(id, fields));
  }

  if (table === 'users') {
    return responseData(await authAPI.updateProfile(fields));
  }

  throw new Error(`Updates are not supported for ${table}`);
}

export async function syncInsert(table, fields) {
  if (table !== 'products') {
    throw new Error(`Inserts are not supported for ${table}`);
  }

  return responseData(await productsAPI.create(fields));
}

export async function syncDelete(table, id) {
  if (table !== 'products') {
    throw new Error(`Deletes are not supported for ${table}`);
  }

  await productsAPI.delete(id);
  return true;
}