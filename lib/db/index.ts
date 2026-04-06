import mongoose from "mongoose";

// Registrar modelos antes de cualquier operación (evita MissingSchemaError en populate)
import "@/models";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI no está definida en las variables de entorno");
}

const uri: string = MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const globalWithMongoose = global as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cache: MongooseCache =
  globalWithMongoose.mongooseCache || { conn: null, promise: null };

export async function connectDB() {
  const readyState = mongoose.connection.readyState;
  const isConnected = readyState === 1;

  // Si la conexión global sigue viva, reutilizamos.
  if (cache.conn && isConnected) return cache.conn;

  // Si hay caché pero mongoose está desconectado/cerrándose, limpiar y reconectar.
  if (cache.conn && !isConnected) {
    cache.conn = null;
    cache.promise = null;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME || "saas-kit-starter"
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    // Permite reintentos limpios en la siguiente llamada.
    cache.promise = null;
    cache.conn = null;
    throw error;
  }
  globalWithMongoose.mongooseCache = cache;

  return cache.conn;
}
