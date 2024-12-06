// >> START jwe-encrypt-decrypt-typescript Example of simple NodeJS function (typescript) for Genesys Cloud Function to perform JWE Encrypt or Decrypt

// Import needed built in and external libraries.
import { Handler } from 'aws-lambda';
import { jweEncrypt, jweDecrypt } from './jwe_utils.js';

// >> START jwe-encrypt-decrypt-typescript-step-1
export const handler: Handler = async (event) => {
    // Retrieve Data Action inputs From Event
    let jweKey = event.jweKey;
    let jweAction = event.jweAction;
    let textToProcess = event.textInput;
// >> END jwe-encrypt-decrypt-typescript-step-1

    try {
        // Test jweAction for undefined, null or empty string
        // - jweKey and textToProcess will be tested for undefined, null or empty string inside the jweEncrypt/jweDecrypt functions
        if (!jweAction) {
            throw new Error('Missing or empty JWE Action');
        }
        
        if (jweAction === 'ENCRYPT') {
            // >> START jwe-encrypt-decrypt-typescript-step-2
            let encrypted = await jweEncrypt(jweKey, textToProcess);
            
            return {
                textOutput: encrypted
            };
            // >> END jwe-encrypt-decrypt-typescript-step-2
        } else if (jweAction === 'DECRYPT') {
            let decrypted = await jweDecrypt(jweKey, textToProcess);

            return {
                textOutput: decrypted
            };
        } else {
            throw new Error(`Unsupported JWE Action - ${jweAction}`);
        }
    } catch (error) {
        // >> START jwe-encrypt-decrypt-typescript-step-3
        // Alternative to callback to return an error
        // This is for irremediable uncaught errors - we can try to send status via successful response otherwise
        console.error("Handler failed: " + error);
        throw error;
        // >> END jwe-encrypt-decrypt-typescript-step-3
    }
};
// >> END jwe-encrypt-decrypt-typescript
