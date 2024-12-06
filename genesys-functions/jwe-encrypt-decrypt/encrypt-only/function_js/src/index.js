// >> START jwe-encrypt-javascript Example of simple NodeJS function (javascript) for Genesys Cloud Function to perform JWE Encrypt

// Import needed built in and external libraries.
const { jweEncrypt } = require('./jwe_utils');

// >> START jwe-encrypt-javascript-step-1
exports.handler = async (event, context, callback) => {
    // Retrieve Data Action inputs From Event
    let jweKey = event.jweKey;
    let textToProcess = event.textInput;
// >> END jwe-encrypt-javascript-step-1

    try {
        // Test for undefined, null or empty string
        // - jweKey and textToProcess will be tested for undefined, null or empty string inside the jweEncrypt/jweDecrypt functions

        // >> START jwe-encrypt-javascript-step-2
        let encrypted = await jweEncrypt(jweKey, textToProcess);
            
        return {
            textOutput: encrypted
        };
        // >> END jwe-encrypt-javascript-step-2
    } catch (error) {
        // >> START jwe-encrypt-javascript-step-3
        // Example of using the callback to return an error
        // This is for irremediable uncaught errors - we can try to send status via successful response otherwise
        console.error("Handler failed: " + error);
        callback(error);
        // >> END jwe-encrypt-javascript-step-3
    }
};
// >> END jwe-encrypt-javascript
