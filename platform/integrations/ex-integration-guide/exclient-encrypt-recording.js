
const platformClient = require('purecloud-platform-client-v2');
const winston = require('winston');
const fs = require('fs');
const path = require('path')
const forge = require('node-forge');
const {spawn} = require('child_process');

const clientId = process.env.GENESYS_CLOUD_CLIENT_ID;
const clientSecret = process.env.GENESYS_CLOUD_CLIENT_SECRET;

// Set the Genesys Cloud region
const client = platformClient.ApiClient.instance;
client.setEnvironment(platformClient.PureCloudRegionHosts.us_east_1);

// Create API instance
const recordingApi = new platformClient.RecordingApi();

// Use winston for logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(), winston.format.prettyPrint()
    ),
    transports: [
        new winston.transports.File({
            filename: `./exclient-encrypt-recording.log`,
        }),
        // Output to console for error logs
        new winston.transports.Console({
            level: 'error',
        })
    ]
});


/* Demonstrate the process to encrypt a recording:
 *
 * Login OAuth client with client ID and secret
 * Fetch the most recent recording key
 * Generate X509 certificate
 * Encrypt the recording file using the certificate
 * Catch and log any error
 */
// >> START ex-generate-intermediate-key
// Use OpenSSL 3.0.x to convert DER to RSA Public Key
async function convertDerToRSAPublicKey(opensslPath, derFileName, pemFileName) {
    return new Promise((resolve, reject) => {
        // openssl rsa -RSAPublicKey_in -in derFileName.der -inform DER -outform PEM -out pemFileName.pem
        let parameters = [
            'rsa', '-RSAPublicKey_in',
            '-in', derFileName,
            '-inform', 'DER', '-outform', 'PEM',
            '-out', pemFileName
        ];

        let opensslProcess = spawn(opensslPath, parameters);
        opensslProcess.on('close', (code) => {
            if (code == 0) {
                resolve(true);
            } else {
                logger.error(`OpenSSL returned ${code} when converting public key`);
                opensslProcess.stdout.pipe(process.stdout);
                resolve(null);
            }
        });
    });
}

// Generate a key pair and save the certificate
async function generateX509Certificate(keyId, pemFileName, certFileName) {
    
    // The key length must be 2048
    var keys = forge.pki.rsa.generateKeyPair(2048);

    // Replace the RSA public key
    let pemBody = fs.readFileSync(pemFileName);
    keys.publicKey = forge.pki.publicKeyFromPem(pemBody);

    // Generate X509 certificate with new public key
    var cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;

    // Make sure the serialNumber starts with "00" and does not contain '-'
    cert.serialNumber = '00' + keyId.replace(/-/g, '');

    // Sign the X509 certificate
    cert.sign(keys.privateKey);

    // Save the certificate pem file
    let certificatePem = forge.pki.certificateToPem(cert);
    var stream = fs.createWriteStream(certFileName);
    stream.write(certificatePem);
}
// >> END ex-generate-intermediate-key
// >> START ex-perform-encryption
// Invoke openssl command to encrypt the file using the certificate file
async function performEncryption(opensslPath, x509CertificateFilePath, originalFilePath, outputFilePath) {
    return new Promise((resolve, reject) => {
        // openssl cms -encrypt -aes256 -in audio.opus -binary -outform DER -out audio.opus.bin f36f8c85-8922-45fa-a3f1-d197d1176340.cert.pem
        let parameters = [
            'cms', '-encrypt', '-aes256',
            '-in', originalFilePath,
            '-binary', '-outform', 'DER',
            '-out', outputFilePath, x509CertificateFilePath
        ];

        let opensslProcess = spawn(opensslPath, parameters);
        opensslProcess.on('close', (code) => {
            if (code == 0) {
                resolve(true);
            } else {
                logger.error(`OpenSSL returned ${code} when performing encryption`);
                opensslProcess.stdout.pipe(process.stdout);
                resolve(false);
            }
        });
    });
}
// >> END ex-perform-encryption
// Encrypt recording file (e.g. recordingFile.opus => recordingFile.opus.bin)
async function encryptRecording(recordingAudioFile) {
    try {

        // Specify the path to OpenSSL executable. Please specify the absolute path if there are multiple OpenSSL versions.
        // This example uses OpenSSL 3.0.7 to perform CMS encryption. Other equivalent CMS encryption tools should also work 
        // but these have not been tested. Run "openssl version" to get the version 
        const opensslPath = 'openssl';

        // Create folder for saving temp files
        let workingDir = path.join(__dirname, 'temp');

        // Create the folders if they do not exist
        if(!fs.existsSync(workingDir)) {
            fs.mkdirSync(workingDir);
        }
// >> START ex-get-encryption-key
        // Login OAuth client
        let response = await client.loginClientCredentialsGrant(clientId, clientSecret);
        logger.verbose('Login successfully');

        // Fetch the most recent recording key by specifying page 1 with a page size of 1
        // Ensure that only a single key is returned
        response = await recordingApi.getRecordingRecordingkeys({
            'pageSize': 1,
            'pageNumber': 1
        });
        logger.verbose(response);
        if(response.total !== 1) {
            logger.error('Failed to retrieve public recording key');
            return false;
        }

        let keyId = response.entities[0].id;
        let publicKey = response.entities[0].keydataSummary;
// >> END ex-get-encryption-key
// >> START ex-encrypt-file
        // OpenSSL CMS encryption requires X509 certificate, so the public key needs to be converted to X509 certificate
        // Save the public key to the binary DER as .der file
        let derFileName = path.join(workingDir, keyId + '.der');
        let keyDer = Buffer.from(publicKey, 'base64');
        var stream = fs.createWriteStream(derFileName);
        stream.write(keyDer);

        // Convert DER to RSA Public Key and save it as .pem file
        let pemFileName = path.join(workingDir, keyId + '.pem');
        await convertDerToRSAPublicKey(opensslPath, derFileName, pemFileName);

        // Generate X509 certificate and save the certificate as .cert.pem file
        let certFileName = path.join(workingDir, keyId + '.cert.pem');
        generateX509Certificate(keyId, pemFileName, certFileName);
        logger.verbose(`Generated X509 certificate file: ${certFileName}`);

        // Perform CMS encryption using the certificate file
        let fileToEncrypt = path.join(__dirname, recordingAudioFile);
        let outputFile = fileToEncrypt + '.bin';
        let isFileEncrypted = await performEncryption(opensslPath, certFileName, fileToEncrypt, outputFile);
// >> END ex-encrypt-file
        if(isFileEncrypted) {
            logger.info(`File ${fileToEncrypt} has been encrypted into ${outputFile}`);
        }
        else {
            logger.error(`Failed to encrypt file ${fileToEncrypt}`);
        }
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

let recordingAudioFile = 'recordingAudio.opus';

encryptRecording(recordingAudioFile);
