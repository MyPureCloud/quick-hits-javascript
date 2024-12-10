// >> START jwe-decrypt-javascript Example of simple NodeJS function (javascript) for Genesys Cloud Function to perform JWE Decrypt

// Import needed built in and external libraries.
const { jweDecrypt } = require('./jwe_utils');

// >> START jwe-decrypt-javascript-step-1
exports.handler = async (event, context, callback) => {
    // Retrieve Data Action inputs From Event
    let jweKey = event.jweKey;
    let textToProcess = event.textInput;
// >> END jwe-decrypt-javascript-step-1

    try {
        // Test for undefined, null or empty string
        // - jweKey and textToProcess will be tested for undefined, null or empty string inside the jweEncrypt/jweDecrypt functions

        // >> START jwe-decrypt-javascript-step-2
        let decrypted = await jweDecrypt(jweKey, textToProcess);

        return {
            textOutput: decrypted
        };
        // >> END jwe-decrypt-javascript-step-2
    } catch (error) {
        // >> START jwe-decrypt-javascript-step-3
        // Example of using the callback to return an error
        // This is for irremediable uncaught errors - we can try to send status via successful response otherwise
        console.error("Handler failed: " + error);
        callback(error);
        // >> END jwe-decrypt-javascript-step-3
    }
};
// >> END jwe-decrypt-javascript
