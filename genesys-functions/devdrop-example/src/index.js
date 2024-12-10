/**
 * Customer Example of simple NodeJS function for Genesys Cloud
 */

const { Buffer } = require('node:buffer');

/**
 * Example of a Node invocation handler. This is exported as "handler" but named async()
 * @param event Input values defined by serverless framework.
 * event.certificate : Example of receiving the credential certificate via the payload in the request event.
 * event.input1String : Example string input.
 * event.input2Boolean : Example boolean input.
 * event.input3Number : Example number input
 *
 * @param context Input context per serverless framework
 * @param callback Callback for error response.
 * @returns {Promise<void>} Expected response as follows:
 *   credentialLength : Size of the certificate. Zero if one is not present.
 *   passwordLength : Length of the password. Zero if one is not present.
 *   echoInput1 : String input.
 *   echoInput2 : Boolean input.
 *   echoInput3 : Number input
 *   contextEcho : Context object. Would contain any header values via the context.clientContext[]
 */
exports.handler = async (event, context, callback) => {
    console.log("## Context: " + JSON.stringify(context));
    console.log("## Event: " + JSON.stringify(event));

    let clientContext = context.clientContext;
    let certificate = event.certificate;
    let password  = clientContext["x-credentialsExamplePassword"]; //Use map array access to context if the name of the attribute contains dashes, e.g. x-, ININ-.

    let certificateLength = (certificate != null) ? Buffer.byteLength(certificate, 'utf8') : 0;
    let passwordLength = ( password!= null) ? Buffer.byteLength(password, 'utf8') : 0;

    //Log the certificate and password lengths so there is an easy way to debug if the values were configured and passed correctly.
    console.log("## certificateLength: " + certificateLength + " passwordLength: " + passwordLength);

    try {
        var response = {};
        response.certificateLength = certificateLength;
        response.passwordLength =  passwordLength;
        if (event.input1String != null) {
            response.echoInput1 = event.input1String;
        }
        if (event.input2Boolean != null) {
            response.echoInput2 = event.input2Boolean;
        }
        if (event.input3Number != null) {
            response.echoInput3 = event.input3Number;
        }

        console.log("Function completed: Returning: " + JSON.stringify(response));
        return response;
    } catch (error) {
        //Example of using the callback to return an error
        console.error("Handler failed: " + error);
        callback(error);
    }
};