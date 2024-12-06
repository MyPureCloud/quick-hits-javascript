// >> START jwe-decrypt-typescript Example of simple NodeJS function (typescript) for Genesys Cloud Function to perform JWE Decrypt

// Import needed built in and external libraries.
import { Handler } from 'aws-lambda';
import { jweDecrypt } from './jwe_utils.js';

// >> START jwe-decrypt-typescript-step-1
export const handler: Handler = async (event) => {
    // Retrieve Data Action inputs From Event
    let jweKey = event.jweKey;
    let textToProcess = event.textInput;
// >> END jwe-decrypt-typescript-step-1

    try {
        // Test for undefined, null or empty string
        // - jweKey and textToProcess will be tested for undefined, null or empty string inside the jweEncrypt/jweDecrypt functions
        
        // >> START jwe-decrypt-typescript-step-2
        let decrypted = await jweDecrypt(jweKey, textToProcess);

        return {
            textOutput: decrypted
        };
        // >> END jwe-decrypt-typescript-step-2
    } catch (error) {
        // >> START jwe-decrypt-typescript-step-3
        // Alternative to callback to return an error
        // This is for irremediable uncaught errors - we can try to send status via successful response otherwise
        console.error("Handler failed: " + error);
        throw error;
        // >> END jwe-decrypt-typescript-step-3
    }
};
// >> END jwe-decrypt-typescript
