// >> START 3rd-party-chat-email-guide Introduction on how to route external objects through Genesys Cloud ACD
const platformClient = require('purecloud-platform-client-v2');
const WebSocket = require('websocket').w3cwebsocket;

// Set Genesys Cloud objects
const client = platformClient.ApiClient.instance;
const notificationsApi = new platformClient.NotificationsApi();
const conversationsApi = new platformClient.ConversationsApi();

// Get client credentials from environment variables
const CLIENT_ID = process.env.GENESYS_CLOUD_CLIENT_ID;
const CLIENT_SECRET = process.env.GENESYS_CLOUD_CLIENT_SECRET;
const ORG_REGION = process.env.GENESYS_CLOUD_REGION; // eg. us_east_1

// Set environment
const environment = platformClient.PureCloudRegionHosts[ORG_REGION];
if(environment) client.setEnvironment(environment);

// Use your own data here
const PROVIDER_NAME = 'Developer Center Tutorial';
const QUEUE_ID = '636f60d4-04d9-4715-9350-7125b9b553db';

// Local vars
let conversationsTopic = null;
let webSocket = null;
// >> START 3rd-party-chat-email-guide-step-1
// Authenticate with Genesys Cloud
client.loginClientCredentialsGrant(CLIENT_ID, CLIENT_SECRET)
	.then(() => {
		console.log('Authenticated with Genesys Cloud');
// >> END 3rd-party-chat-email-guide-step-1
		// Create a new notification channel for this app
		return notificationsApi.postNotificationsChannels();
	})
    // >> START 3rd-party-chat-email-guide-step-2
	.then((channel) => {
		// Subscribe to conversation notifications for the queue
		conversationsTopic = 'v2.routing.queues.' + QUEUE_ID + '.conversations.emails';
		notificationsApi.putNotificationsChannelSubscriptions(channel.id, [ { id: conversationsTopic } ])
			.catch((err) => console.log(err));

		// Open a new web socket using the connect Uri of the channel
		webSocket = new WebSocket(channel.connectUri);
		webSocket.onopen = () => {
			// Create a new 3rd party email
			createEmail();
		};
        // >> START 3rd-party-chat-email-guide-step-4
		// Message received callback function
		webSocket.onmessage = (message) => {
			// Parse string message into JSON object
			let data = JSON.parse(message.data);

			// Filter out unwanted messages
			if (data.topicName.toLowerCase() === 'channel.metadata') {
				console.log(`Heartbeat ${new Date()}`);
				return;
			} else if (data.topicName.toLowerCase() !== conversationsTopic.toLowerCase()) {
				console.log(`Unexpected notification: ${JSON.stringify(data)}`);
				return;
			}
			
			// Color text red if it matches this provider
			let providerText = data.eventBody.participants[0].provider;
			if(data.eventBody.participants[0].provider === PROVIDER_NAME) {
				providerText = `\x1b[31m${providerText}\x1b[0m`;	
			}
			
			// Log some info
			console.log(`[${providerText}] id:${data.eventBody.id} from:${data.eventBody.participants[0].name} <${data.eventBody.participants[0].address}>`);
		};
        // >> END 3rd-party-chat-email-guide-step-4
	})
	.catch((err) => console.log(err));
    // >> END 3rd-party-chat-email-guide-step-2

// >> START 3rd-party-chat-email-guide-step-3
// Creates a 3rd party email
// https://developer.mypurecloud.com/api/rest/v2/conversations/third-party-object-routing.html
function createEmail() {
	let emailData = {
		queueId: QUEUE_ID,
		provider: PROVIDER_NAME,
		toAddress: 'Developer Tutorial',
		toName: 'Developer Tutorial',
		fromAddress: 'no-reply@mypurecloud.com',
		fromName: 'John Doe',
		subject: 'External system email'
	};

	conversationsApi.postConversationsEmails(emailData)
		.then((conversation) => {
			const conversationId = conversation.id;
			console.log(`Created email, conversation id:${conversationId}`);
		})
		.catch((err) => console.log(err));
}
// >> END 3rd-party-chat-email-guide-step-3
// >> END 3rd-party-chat-email-guide
