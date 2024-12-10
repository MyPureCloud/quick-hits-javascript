// >> START jwe-encrypt-decrypt-javascript Example of simple NodeJS function (javascript) for Genesys Cloud Function to perform JWE Encrypt or Decrypt

// Import needed built in and external libraries.
const { jweEncrypt, jweDecrypt } = require('./jwe_utils');

// >> START jwe-encrypt-decrypt-javascript-step-1
exports.handler = async (event, context, callback) => {
    // Retrieve Data Action inputs From Event
    let jweKey = event.jweKey;
    let jweAction = event.jweAction;
    let textToProcess = event.textInput;
// >> END jwe-encrypt-decrypt-javascript-step-1

    try {
        // Test jweAction for undefined, null or empty string
        // - jweKey and textToProcess will be tested for undefined, null or empty string inside the jweEncrypt/jweDecrypt functions
        if (!jweAction) {
            throw new Error('Missing or empty JWE Action');
        }
        
        if (jweAction === 'ENCRYPT') {
            // >> START jwe-encrypt-decrypt-javascript-step-2
            let encrypted = await jweEncrypt(jweKey, textToProcess);
            
            return {
                textOutput: encrypted
            };
            // >> END jwe-encrypt-decrypt-javascript-step-2
        } else if (jweAction === 'DECRYPT') {
            let decrypted = await jweDecrypt(jweKey, textToProcess);

            return {
                textOutput: decrypted
            };
        } else {
            throw new Error(`Unsupported JWE Action - ${jweAction}`);
        }
    } catch (error) {
        // >> START jwe-encrypt-decrypt-javascript-step-3
        // Example of using the callback to return an error
        // This is for irremediable uncaught errors - we can try to send status via successful response otherwise
        console.error("Handler failed: " + error);
        callback(error);
        // >> END jwe-encrypt-decrypt-javascript-step-3
    }
};
// >> END jwe-encrypt-decrypt-javascript
