// >> START get-user-active-conv-axios-javascript Example of simple NodeJS function (javascript) for Genesys Cloud Function to perform Genesys Cloud Platform API requests

// Import needed built in and external libraries.
const { verifyGCToken, requestGCToken, findGCUser, findActiveConversationsForGCUser } = require('./gc_axios_utils');

// >> START get-user-active-conv-axios-javascript-step-1
var functionLocalCache_GCToken = null;
// >> END get-user-active-conv-axios-javascript-step-1

// >> START get-user-active-conv-axios-javascript-step-2
exports.handler = async (event, context, callback) => {
    // Retrieve Data Action inputs From Client Context
    let clientContext = context.clientContext;
    let gcClientId = clientContext["x-gc-id"];
    let gcClientSecret = clientContext["x-gc-secret"];
    let gcRegion = clientContext["x-gc-region"];

    // Retrieve Data Action inputs From Event
    let inputType = event.inputType;
    let inputId = event.inputId;
    let mediaType = event.mediaType;
// >> END get-user-active-conv-axios-javascript-step-2

    try {
        // Test for undefined, null or empty string
        // - gcRegion, gcClientId and gcClientSecret will be tested for undefined, null or empty string inside the gc_utils functions
        
        // >> START get-user-active-conv-axios-javascript-step-3
        let gcToken = functionLocalCache_GCToken;
        let isValidToken = await verifyGCToken(gcRegion, gcToken);
        if (isValidToken == false) {
            gcToken = await requestGCToken(gcRegion, gcClientId, gcClientSecret);
            functionLocalCache_GCToken = gcToken;
        } else {
            console.log("## Token: token retrieved");
        }
        // >> END get-user-active-conv-axios-javascript-step-3

        if (!inputType) {
            throw new Error('Missing Input Type');
        }
        if (inputType !== 'USERNAME' && inputType !== 'EMAIL' && inputType !== 'EMPLOYEE_ID') {
            throw new Error('Invalid Input Type');
        }
        if (!inputId) {
            throw new Error('Missing Input Id');
        }
        if (!mediaType) {
            throw new Error('Missing Media Type');
        }

        // >> START get-user-active-conv-axios-javascript-step-4
        // Find user based on username, email or employeeId
        let searchUserResults = await findGCUser(gcRegion, gcToken, inputType, inputId);
        let userId = null;
        if (searchUserResults && searchUserResults.total === 0) {
            // User was not found
            return {
                status: false,
                errorMesssage: 'User was not found',
                userId: '',
                userPresence: '',
                userRoutingStatus: '',
                associatedStation: false,
                nbActiveConversations: 0,
                activeConversations: []
            };
        } else {
            let firstUser = searchUserResults.results[0];
            userId = firstUser.id;
            if (firstUser.state === 'active') {
                // user is active
                // We may want to check in conversationSummary if there are active conversations
                let nbActiveConversationsFromConversationSummary = 0;
                for (let mediaKey in firstUser.conversationSummary) {
                    nbActiveConversationsFromConversationSummary = nbActiveConversationsFromConversationSummary + firstUser.conversationSummary[mediaKey].contactCenter.active + firstUser.conversationSummary[mediaKey].enterprise.active;
                }
                let hasAssociatedStation = false;
                if (firstUser.station && firstUser.station.associatedStation) hasAssociatedStation = true;
                // and run a Query for Conversation Details only if different from 0
                if (nbActiveConversationsFromConversationSummary > 0) {
                    // Check/Find active conversations for the user
                    let searchUserResults = await findActiveConversationsForGCUser(gcRegion, gcToken, userId, mediaType);
                    
                    let activeConversations = [];
                    if (searchUserResults && searchUserResults.conversations && searchUserResults.conversations.length > 0) {
                        activeConversations = searchUserResults.conversations.map((conv) => conv.conversationId);
                    }

                    return {
                        status: true,
                        errorMesssage: '',
                        userId: userId,
                        userPresence: firstUser?.presence?.presenceDefinition?.systemPresence ?? '',
                        userRoutingStatus: firstUser?.routingStatus?.status ?? '',
                        associatedStation: hasAssociatedStation,
                        nbActiveConversations: nbActiveConversationsFromConversationSummary,
                        activeConversations: activeConversations
                    };
                } else {
                    return {
                        status: true,
                        errorMesssage: '',
                        userId: userId,
                        userPresence: firstUser?.presence?.presenceDefinition?.systemPresence ?? '',
                        userRoutingStatus: firstUser?.routingStatus?.status ?? '',
                        associatedStation: hasAssociatedStation,
                        nbActiveConversations: nbActiveConversationsFromConversationSummary,
                        activeConversations: []
                    };
                }
            } else {
                // user is inactive or deleted
                return {
                    status: false,
                    errorMesssage: `User (${userId}) is in ${firstUser.state} state`,
                    userId: userId,
                    userPresence: '',
                    userRoutingStatus: '',
                    associatedStation: false,
                    nbActiveConversations: 0,
                    activeConversations: []
                };
            }
            // >> END get-user-active-conv-axios-javascript-step-4
        }
    } catch (error) {
        // >> START get-user-active-conv-axios-javascript-step-5
        console.error("Handler failed: " + error);
        return {
            status: false,
            errorMesssage: error?.message ?? 'Error',
            userId: '',
            userPresence: '',
            userRoutingStatus: '',
            associatedStation: false,
            nbActiveConversations: 0,
            activeConversations: []
        };
        // >> END get-user-active-conv-axios-javascript-step-5
    }
};
// >> END get-user-active-conv-axios-javascript

