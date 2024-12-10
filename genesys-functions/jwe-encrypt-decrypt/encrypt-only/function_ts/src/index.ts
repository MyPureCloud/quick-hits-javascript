// >> START jwe-encrypt-typescript Example of simple NodeJS function (typescript) for Genesys Cloud Function to perform JWE Encrypt

// Import needed built in and external libraries.
import { Handler } from 'aws-lambda';
import { jweEncrypt } from './jwe_utils.js';

// >> START jwe-encrypt-typescript-step-1
export const handler: Handler = async (event) => {
    // Retrieve Data Action inputs From Event
    let jweKey = event.jweKey;
    let textToProcess = event.textInput;
// >> END jwe-encrypt-typescript-step-1

    try {
        // Test for undefined, null or empty string
        // - jweKey and textToProcess will be tested for undefined, null or empty string inside the jweEncrypt/jweDecrypt functions
        
        // >> START jwe-encrypt-typescript-step-2
        let encrypted = await jweEncrypt(jweKey, textToProcess);
            
        return {
            textOutput: encrypted
        };
        // >> END jwe-encrypt-typescript-step-2
    } catch (error) {
        // >> START jwe-encrypt-typescript-step-3
        // Alternative to callback to return an error
        // This is for irremediable uncaught errors - we can try to send status via successful response otherwise
        console.error("Handler failed: " + error);
        throw error;
        // >> END jwe-encrypt-typescript-step-3
    }
};
// >> END jwe-encrypt-typescript
