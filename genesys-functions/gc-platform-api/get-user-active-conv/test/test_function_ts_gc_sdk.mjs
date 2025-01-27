import { handler } from '../function_ts_gc_sdk/dist/index.js';
import { default as fs } from 'fs';
try {
    console.log(JSON.stringify(
        await handler(
            JSON.parse(fs.readFileSync(process.argv[2])),
            JSON.parse(fs.readFileSync(process.argv[3])),
            function (data, result) { if (data !== null && data !== undefined) { throw data; } else { if (result !== null && result !== undefined) console.log(JSON.stringify(result, null, 4)); } }
        ), null, 4));
} catch (err) {
    console.error(JSON.stringify({ errorMessage: err.message, errorType: err.name, stackTrace: err.stack }, null, 4));
}