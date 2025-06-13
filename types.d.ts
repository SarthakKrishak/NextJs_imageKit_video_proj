import { Connection } from "mongoose";

//We have to use "var" here otherwise it will not detect this changes
// As for global scope "var" is used and for block scope "let" is used.
declare global {
    var mongoose: {
        conn: Connection | null;
        promise: Promise<Connection> | null;
    };
}

export {}; // ensure it's treated as a module
