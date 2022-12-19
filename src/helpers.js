import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

export const getDirname = (filePath) => dirname(fileURLToPath(filePath));

export const getPath = (fileName) => resolve(getDirname(import.meta.url), fileName);