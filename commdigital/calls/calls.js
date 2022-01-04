// >> START calls
/* globals Handlebars */

// This client ID expects the redirect URL to be http://localhost:8080/
const clientId = 'babbc081-0761-4f16-8f56-071aa402ebcb';
const redirectUri = window.location.href;

// Set Genesys Cloud objects
const platformClient = require('platformClient');
const client = platformClient.ApiClient.instance;
const conversationsApi = new platformClient.ConversationsApi();
const notificationsApi = new platformClient.NotificationsApi();
const usersApi = new platformClient.UsersApi();

// Set Genesys Cloud settings
client.setEnvironment('mypurecloud.com');
client.setPersistSettings(true, 'test_app');

// Set local vars
let CONVERSATION_LIST_TEMPLATE = null;
let conversationList = {};
let me, webSocket, conversationsTopic, notificationChannel;

// Set up handlebars
Handlebars.registerHelper('unlessCond', (v1, v2, options) => {
	if(v1 !== v2) {
		return options.fn(this);
	}
	return options.inverse(this);
});

Handlebars.registerHelper('isConsult', (participants, options) => {
	if(participants.length > 2) {
		return options.fn(this);
	}
	return options.inverse(this);
});

// jQuery calls this when the DOM is available
$(document).ready(() => {
	// Authenticate with Genesys Cloud
	client.loginImplicitGrant(clientId, redirectUri)
		.then(() => {
			console.log('Logged in');

			// >> START calls-step-2
			// >> START calls-step-3
			// Get authenticated user's info
			return usersApi.getUsersMe();
		})
		.then((userMe) => {
			console.log('userMe: ', userMe);
			me = userMe;
			// >> END calls-step-3

			// >> START calls-step-4
			// Create notification channel
			return notificationsApi.postNotificationsChannels();
		})
		.then((channel) => {
			console.log('channel: ', channel);
			notificationChannel = channel;
			// >> END calls-step-4

			// >> START calls-step-5
			// Set up web socket
			webSocket = new WebSocket(notificationChannel.connectUri);
			webSocket.onmessage = handleNotification;

			// Subscribe to authenticated user's conversations
			conversationsTopic = 'v2.users.' + me.id + '.conversations';
			const body = [ { id: conversationsTopic } ];
			return notificationsApi.putNotificationsChannelSubscriptions(notificationChannel.id, body);
			// >> END calls-step-5
		})
		// >> END calls-step-2
		.then((topicSubscriptions) => {
			console.log('topicSubscriptions: ', topicSubscriptions);

			CONVERSATION_LIST_TEMPLATE = Handlebars.compile($('#entry-template').html());

			// >> START calls-step-1
			// Handle dial button click
			$('button#dial').click(() => {
				// Create request body
				let body = {
					'phoneNumber':$('input#dialstring').val()
				};

				// Invoke API
				conversationsApi.postConversationsCalls(body).then(() => {
					// Clear dialstring from text box
					$('input#dialstring').val('');
				}).catch((err) => console.error(err));
			});
			// >> END calls-step-1
		})
		.catch((err) => console.error(err));
});

// >> START calls-step-6
// Handle incoming Genesys Cloud notification from WebSocket
function handleNotification(message) {
	// Parse notification string to a JSON object
	const notification = JSON.parse(message.data);

	// Discard unwanted notifications
	if (notification.topicName.toLowerCase() === 'channel.metadata') {
		// Heartbeat
		console.info('Ignoring metadata: ', notification);
		return;
	} else if (notification.topicName.toLowerCase() !== conversationsTopic.toLowerCase()) {
		// Unexpected topic
		console.warn('Unknown notification: ', notification);
		return;
	} else {
		console.debug('Conversation notification: ', notification);
	}

	// See function description for explanation
	copyCallPropsToParticipant(notification.eventBody);

	// Update conversation in list or remove it if disconnected
	if (isConversationDisconnected(notification.eventBody))
		delete conversationList[notification.eventBody.id];
	else
		conversationList[notification.eventBody.id] = notification.eventBody;

	// Update UI
	$('#call-table').html(CONVERSATION_LIST_TEMPLATE(Object.values(conversationList)));
}
// >> END calls-step-6

/* This function copies properties from the participant's call object in a notification to the 
 * participant object to make the participant object look the same as the response from the 
 * conversations APIs. This isn't strictly necessary, but is helpful to maintain a consistent structure.
 */
function copyCallPropsToParticipant(conversation) {
	conversation.participants.forEach((participant) => {
		if (!participant.calls || participant.calls.length === 0) return;

		participant.ani = participant.calls[0].self.addressNormalized;
		participant.attributes = participant.additionalProperties;
		participant.confined = participant.calls[0].confined;
		participant.direction = participant.calls[0].direction;
		participant.dnis = participant.calls[0].other.addressNormalized;
		participant.held = participant.calls[0].held;
		participant.muted = participant.calls[0].muted;
		participant.provider = participant.calls[0].provider;
		participant.recording = participant.calls[0].recording;
		participant.recordingState = participant.calls[0].recordingState;
		participant.state = participant.calls[0].state;
		if (participant.userId)
			participant.user = { id: participant.userId, selfUri: `/api/v2/users/${participant.userId}` };
		if (participant.calls[0].peerId)
			participant.peer = participant.calls[0].peerId;
	});
}

// Determines if a conversation is disconnected by checking to see if all participants are disconnected
function isConversationDisconnected(conversation) {
	let isConnected = false;
	conversation.participants.some((participant) => {
		if (participant.state !== 'disconnected') {
			isConnected = true;
			return true;
		}
	});

	return !isConnected;
}

// >> START calls-step-7
// Mute participant
function mute(callId, participantId, currentMuteState) {
	// Create request body, only set desired properties
	let body = {
		'muted': !currentMuteState
	};

	// Invoke API
	conversationsApi.patchConversationsCallParticipant(callId, participantId, body)
		.then(() => {
			// Result will be empty here
		}).catch((err) => console.error(err));
}

// Hold participant
function hold(callId, participantId, currentHoldState) {
	// Create request body, only set desired properties
	let body = {
		'held': !currentHoldState
	};

	// Invoke API
	conversationsApi.patchConversationsCallParticipant(callId, participantId, body)
		.then(() => {
			// Result will be empty here
		}).catch((err) => console.error(err));
}
// >> END calls-step-7

// >> START calls-step-10
// Disconnect participant
function disconnect(callId, participantId) {
	// Create request body, only set desired properties
	let body = {
		'state': 'disconnected'
	};

	// Invoke API
	conversationsApi.patchConversationsCallParticipant(callId, participantId, body)
		.then(() => {
			// Result will be empty here
		}).catch((err) => console.error(err));
}
// >> END calls-step-10

// >> START calls-step-8
// Initiate a consult transfer
function startConsult() {
	console.debug(conversationList);
	let callId = conversationList[Object.keys(conversationList)[0]].id;

	// Grab the first participant, which should be the party we dialed for an outbound call
	let participantId = conversationList[callId].participants[1].id;

	// Create request body
	let body = {
		'speakTo': 'destination',
		'destination':{
			'address' : $('input#newparticipant').val()
		}
	};

	// Invoke API
	conversationsApi.postConversationsCallParticipantConsult(callId, participantId, body)
		.then(() => {
			$('input#newparticipant').val('');
			// We can ignore the response in this guide.
		}).catch((err) => console.error(err));
}
// >> END calls-step-8

// >> START calls-step-9
// Change which parties in the consult transfer are speaking
function consultSpeakTo(speakTo) {
	let callId = conversationList[Object.keys(conversationList)[0]].id;

	//grab the first participant, which should be the party we dialed for an outbound call
	let participantId = conversationList[callId].participants[1].id;

	// Create request body
	let body = {
		'speakTo': speakTo
	};

	// Invoke API
	conversationsApi.patchConversationsCallParticipantConsult(callId, participantId, body)
		.then(() => {
			// We can ignore the response in this guide.
		}).catch((err) => console.error(err));
}
// >> END calls-step-9
// >> END calls