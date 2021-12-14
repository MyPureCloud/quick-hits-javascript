// >> START oauth-client-credentials Client credentials grant login without a client library
const fetch = require('node-fetch');

const clientId = process.env.GENESYS_CLOUD_CLIENT_ID;
const clientSecret = process.env.GENESYS_CLOUD_CLIENT_SECRET;
const environment = process.env.GENESYS_CLOUD_ENVIRONMENT; // expected format: mypurecloud.com

// >> START oauth-client-credentials-step-2
// Test token by getting role definitions in the organization.
function handleTokenCallback(body){
    return fetch(`https://api.${environment}/api/v2/authorization/roles`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${body.token_type} ${body.access_token}`
        }
    })
    .then(res => {
        if(res.ok){
            return res.json();
        } else {
            throw Error(res.statusText);
        }
    })
    .then(jsonResponse => {
        console.log(jsonResponse);
    })
    .catch(e => console.error(e));
}
// >> END oauth-client-credentials-step-2

// >> START oauth-client-credentials-step-1 
// Genesys Cloud Authentication
const params = new URLSearchParams();
params.append('grant_type', 'client_credentials');

fetch(`https://login.${environment}/oauth/token`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(clientId + ':' + clientSecret).toString('base64')}`
    },
    body: params
})
// >> END oauth-client-credentials-step-1 
.then(res => {
    if(res.ok){
        return res.json();
    } else {
        throw Error(res.statusText);
    }
})
.then(jsonResponse => {
    console.log(jsonResponse);
    handleTokenCallback(jsonResponse);
})
.catch(e => console.error(e));
// >> END oauth-client-credentials
