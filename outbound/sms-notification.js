// >> START sms-notification
// Set Genesys Cloud objects
const platformClient = require('purecloud-platform-client-v2');
const client = platformClient.ApiClient.instance;

// Instantiate conversation API
let ConversationsApi = new platformClient.ConversationsApi();

// >> START sms-notification-step-1
// Get client credentials from environment variables
const CLIENT_ID = process.env.GENESYS_CLOUD_CLIENT_ID;
const CLIENT_SECRET = process.env.GENESYS_CLOUD_CLIENT_SECRET;
const ORG_REGION = process.env.GENESYS_CLOUD_REGION; // eg. us_east_1

// Set environment
const environment = platformClient.PureCloudRegionHosts[ORG_REGION];
if(environment) client.setEnvironment(environment);
// >> END sms-notification-step-1

// >> START sms-notification-step-2
// Authenticate with Genesys Cloud
client.loginClientCredentialsGrant(CLIENT_ID, CLIENT_SECRET)
// >> END sms-notification-step-2
    .then(() => {

// >> START sms-notification-step-3
        let body = {
            "fromAddress": "+13178723000",
            "toAddress": "+15557655942",
            "toAddressMessengerType": "sms",
            "textBody": "Hello, this is a test notification"
        }
        
        // call conversation API and send message
        ConversationsApi.postConversationsMessagesAgentless(body)
            .then((data) => {
                console.log(`postConversationsMessagesAgentless success! data: 
                ${JSON.stringify(data, null, 2)}`);
            })
            .catch((err) => {
                console.log('There was a failure calling postConversationsMessagesAgentless');
                console.error(err);
            });
// >> END sms-notification-step-3
    })
    .catch((err) => console.log(err));
// >> END sms-notification