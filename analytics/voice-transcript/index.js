// >> START voice-transcript
const prompt = require('prompt');
const fetch = require('node-fetch');
const platformClient = require('purecloud-platform-client-v2');

// Get client ID and secret from environment vars
const GENESYS_CLOUD_CLIENT_ID = process.env.GENESYS_CLOUD_CLIENT_ID;
const GENESYS_CLOUD_CLIENT_SECRET = process.env.GENESYS_CLOUD_CLIENT_SECRET;

// >> START voice-transcript-step-3
// Set Genesys Cloud objects
const client = platformClient.ApiClient.instance;
const conversationsApi = new platformClient.ConversationsApi();
const speechTextAnalyticsApi = new platformClient.SpeechTextAnalyticsApi();
// >> END voice-transcript-step-3

// Set Genesys Cloud settings
client.setEnvironment('mypurecloud.com');
client.setPersistSettings(true, 'test_app');

// >> START voice-transcript-step-1
// Input Properties
let schema = {
    properties: {
        conversationId: {
            message: 'Conversation ID',
            required: true
        }
    }
};
// >> END voice-transcript-step-1

// >> START voice-transcript-step-2
// Start the prompt
prompt.start();
// OAuth Login
prompt.get(schema, function (_err, result) {
    client.loginClientCredentialsGrant(GENESYS_CLOUD_CLIENT_ID, GENESYS_CLOUD_CLIENT_SECRET)
    .then(() => {
        getConversationDetails(result.conversationId)
    }).catch((err) => {
        // Handle failure response
        console.log(err);
    });
});
// >> END voice-transcript-step-2

// >> START voice-transcript-step-4
function getConversationDetails(conversationId) {
    conversationsApi.getConversation(conversationId)
    .then((conversationDetails) => {
        let customer = conversationDetails.participants.find(p => p.purpose == 'customer');
        let communicationId = customer.calls[0].id;

        getSentimentScore(conversationId);
        getTranscriptUrl(conversationId, communicationId);
    });
}
// >> END voice-transcript-step-4

// >> START voice-transcript-step-5
function getSentimentScore(conversationId) {
    speechTextAnalyticsApi.getSpeechandtextanalyticsConversation(conversationId)
    .then((data) => {
        console.log('Sentiment Score: ' + data.sentimentScore);
    })
}
// >> END voice-transcript-step-5

// >> START voice-transcript-step-6
function getTranscriptUrl(conversationId, communicationId) {
    speechTextAnalyticsApi.getSpeechandtextanalyticsConversationCommunicationTranscripturl(conversationId, communicationId)
    .then((data) => {
        let settings = { method: 'Get' };

        // >> START voice-transcript-step-7
        // Fetch the returned JSON object from the S3 URL
        fetch(data.url, settings)
        // >> END voice-transcript-step-7
        .then(res => res.json())
        .then((json) => {
            // Display transcript
            for(phrase of json.transcripts[0].phrases) {
                // >> START voice-transcript-step-8
                // Identify if Agent or Customer
                let purpose = (phrase.participantPurpose == 'internal') ? 'Agent' : 'Customer';
                // >> END voice-transcript-step-8
                console.log(purpose + ': ' + phrase.text);
            }
        });
    })
}
// >> END voice-transcript-step-6

// >> END voice-transcript