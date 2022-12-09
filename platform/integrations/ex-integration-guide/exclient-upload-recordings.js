const platformClient = require('purecloud-platform-client-v2');
const winston = require('winston');

const fetch = require('node-fetch');
const fs = require('fs');
const md5 = require('md5-file');

const clientId = process.env.GENESYS_CLOUD_CLIENT_ID;
const clientSecret = process.env.GENESYS_CLOUD_CLIENT_SECRET;

// Set the Genesys Cloud region
const client = platformClient.ApiClient.instance;
client.setEnvironment(platformClient.PureCloudRegionHosts.us_east_1);

// Create API instance
const uploadsApi = new platformClient.UploadsApi();

// Use winston for logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(), winston.format.prettyPrint()
    ),
    transports: [
        new winston.transports.File({
            filename: `./exclient-upload-recordings.log`,
        }),
        // Output to console for error logs
        new winston.transports.Console({
            level: 'error',
        })
    ]
});


/* Demonstrate the process to upload recordings:
 *
 * Login OAuth client with client ID and secret
 * Load the file and create the MD5 hash
 * Obtain a presigned URL
 * Upload the file to the presigned URL
 * Catch and log any error
 */

async function uploadRecordings(fileName) {
    try {
        let response = await client.loginClientCredentialsGrant(clientId, clientSecret);
        logger.verbose('Login successfully');
// >> START ex-get-presigned-url
        // Get base64-encoded 128-bit MD5 digest of the file content
        let md5sum = await md5(fileName);
        let md5Base64 = Buffer.from(md5sum, 'hex').toString('base64');
        logger.verbose(md5Base64);

        // Get the presigned URL
        // signedUrlTimeoutSeconds is optional for the number of seconds the presigned URL is valid for (1-604800).
        // The default value is 600 seconds if it is not provided
        response = await uploadsApi.postUploadsRecordings({
            'fileName': fileName,
            'contentMd5': md5Base64,
            'signedUrlTimeoutSeconds': 600
        });
        logger.info(response);
// >> END ex-get-presigned-url
        // Get the presigned URL from the response
        let presignedUploadUrl = response.url;
        // Save the headers in returned response for the following upload
        let responseHeaders = response.headers;
// >> START ex-upload-file
        // Upload the file to the presigned URL
        const fileContent = fs.readFileSync(fileName);
        logger.info(`Upload ${fileName} to the presigned URL`)
        response = await fetch(presignedUploadUrl, {
            method: 'PUT',
            headers: responseHeaders,
            body: fileContent
            });
        let responseBody = await response.text();
        logger.info(responseBody);
        return responseBody;
// >> END ex-upload-file
    }
    catch(err) {
        // Directly logging an error in winston would result in empty string
        if (err instanceof Error) {
            logger.error(`${err.stack || err}`);
        }
        // Handle failure response
        else {
            logger.error(err);
        }
    }
}

// The recording file to be uploaded
/* Note: The recording file and metadata.json shall be at the top level of the zip file.
   Zipping up the folder that contains the recording file and the metadata.json would cause a validation failure

   recordingExample.zip
     |--- audioExampleRecording.opus.bin
     |--- metadata.json
 */

const fileName = 'recordingExample.zip';

uploadRecordings(fileName);
