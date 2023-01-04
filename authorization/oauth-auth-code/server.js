// >> START oauth-auth-code Authorization code grant login without a client library
const http = require('http');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const { URLSearchParams } = require('url');

const app = express();

// OAuth Code Authorization Credentials
const clientId = process.env.GENESYS_CLOUD_CLIENT_ID;
const clientSecret = process.env.GENESYS_CLOUD_CLIENT_SECRET;
const environment = process.env.GENESYS_CLOUD_ENVIRONMENT; // eg. 'mypurecloud.com'

const PORT = '8085';

// >> START oauth-auth-code-step-2
/**
 * This function is used as an express middleware and will be invoked in
 * every HTTP request that hits the webserver. If there is no session with 
 * Genesys Cloud, redirect the user to the Genesys Cloud login page.
 */
const authvalidation = function(req, res, next) {
    console.log(`\n[${req.method} ${req.url}]`);

    // If we don't have a session then redirect them to the login page
    if((req.cookies && !(req.cookies.session && sessionMap[req.cookies.session])) &&
            req.url.indexOf('oauth') == -1){
        //redirect the user to authorize with Genesys Cloud
        var redirectUri = `https://login.${environment}/oauth/authorize?` +
                    'response_type=code' +
                    '&client_id=' + clientId +
                    `&redirect_uri=http://localhost:${PORT}/oauth2/callback`;

        console.log('redirecting to ' + redirectUri);
        res.redirect(redirectUri);

        return;
    }

    // if we do have a session, just pass along to the next http handler
    console.log('Session exists')
    next();
};
// >> END oauth-auth-code-step-2

// Registration of express middlewares
app.use(express.json());
app.use(cookieParser());
app.use(authvalidation);
app.use(express.static(__dirname));

var sessionMap ={};

app.get('/', function(req, res){
    res.redirect('/my_info.html');
})

// >> START oauth-auth-code-step-3
//this route handles the oauth callback
app.get('/oauth2/callback', async function(req,res){
    // The authorization page has called this callback and now we need to get the bearer token
    console.log('oauth callback')
    console.log(req.query.code)
    const authCode = req.query.code;

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', authCode);
    params.append('redirect_uri', `http://localhost:${PORT}/oauth2/callback`);

    axios({
        url: `https://login.${environment}/oauth/token`, 
        method: 'post',
        headers: {
           'Content-Type': 'application/x-www-form-urlencoded',
           'Authorization': `Basic ${Buffer.from(clientId + ':' + clientSecret).toString('base64')}`
        },
        params: params
    })
    .then(response => {
        const tokenData = response.data;
        console.log('got token data back: ')
        console.log(tokenData);

        var sessionId = uuidv4();

        // Store the session id as a key in the session map, the value is the bearer token for Genesys Cloud.
        // We want to keep that secure so won't send that back to the client
        sessionMap[sessionId] = tokenData.access_token;

        // Send the session id back as a cookie
        res.cookie('session', sessionId);
        res.redirect('/my_info.html');    
    })
    .catch(e => console.error(e));
});
// >> END oauth-auth-code-step-3

// >> START oauth-auth-code-step-5
//wrap up the api/v2/users/me call inside a /me route
app.get('/me', function(req, res){
    // Get the session from map using the cookie
    const oauthId = sessionMap[req.cookies.session];

    axios({
        url: `https://api.${environment}/api/v2/users/me`,
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${oauthId}`
        }
    })
    .then(response => {
        const user = response.data;
        console.log('Got response for /users/me');
        console.log(user);
        res.send(user);
    })
    .catch(e => console.error(e));

});
// >> END oauth-auth-code-step-5

// >> START oauth-auth-code-step-1
var httpServer = http.createServer(app);
httpServer.listen(PORT);
console.log(`Server ready: http://localhost:${PORT}`);
// >> END oauth-auth-code-step-1
// >> END oauth-auth-code
