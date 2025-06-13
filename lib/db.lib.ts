// Why are we writing all this code instead of just using mongoose.connect() directly?

// In a Next.js application — especially when using API routes or the new app router (app directory) —
// your backend functions can be re-invoked frequently due to hot reloading in development,
// or new serverless function instances being spun up in production.

// This means we need to manage our MongoDB connection carefully to avoid:
// 1. Opening multiple connections (which can crash MongoDB or exhaust resources).
// 2. Reconnecting every time a function is called (inefficient).
// 3. Handling an in-progress connection attempt (a Promise in flight).

// So we use a global variable (global.mongoose) to cache the connection state across requests.
// The 3 states we handle are:
// 1. Connected     => reuse the connection
// 2. Not connected => create a new connection
// 3. Connecting    => wait for the Promise that is currently establishing a connection

// That's why we are checking the promise and other things.

import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!;

// uri check
if (!MONGODB_URI) {
    throw new Error("Please define MONGODB URI")
}
const cached = global.mongoose;

// If we dont have a connection then make all of them as null
if (!cached) {
    global.mongoose = {conn: null,promise:null}
}

export async function connectToDB() {
    // We have a connection
    if (cached.conn) {
        return cached.conn
    }
    
    // now checking for promise as maybe the connection was on the way to connect.
    // Here we are checking that if no promise is there
    if (!cached.promise) {

        const opts = {
            bufferCommands: true,
            maxPoolSize:10
        }
        mongoose
            .connect(MONGODB_URI!, opts)
            .then(() => mongoose.connection)
            .catch(()=>{console.log("Unable to Connect MongoDB");
        })
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw error;
    }
    return cached.conn;
}