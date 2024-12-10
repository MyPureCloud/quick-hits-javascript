'use strict';

// Import needed built in and external libraries.
// Obtain a reference to the platformClient object
const platformClient = require('purecloud-platform-client-v2');

const client = platformClient.ApiClient.instance;

const HTTP_REQ_TIMEOUT = 3000;

//#region - Genesys Cloud OAuth

async function verifyGCToken(gcRegion, gcToken) {
    // Test for undefined, null or empty string
    if (!gcRegion) {
        throw new Error('Unset GC Region');
    }

    if (!gcToken) {
        return false;
    }

    try {
        client.setEnvironment(gcRegion);
        client.setAccessToken(gcToken);
        const tokensApi = new platformClient.TokensApi(client);

        const response = await headTokensMe();

        return true;
    } catch (e) {
        // API Errors, Axios errors and locally raised errors
        return false;
    }
}

async function requestGCToken(gcRegion, gcClientId, gcClientSecret) {
    // Test for undefined, null or empty string
    if (!gcRegion) {
        throw new Error('Unset GC Region');
    }
    if (!gcClientId) {
        throw new Error('Unset GC Client ID');
    }
    if (!gcClientSecret) {
        throw new Error('Unset GC Client Secret');
    }

    try {
        client.setEnvironment(gcRegion);

        const authData = await client.loginClientCredentialsGrant(gcClientId,gcClientSecret);
        
        if (authData && authData.accessToken) {
            return authData.accessToken;
        }
        throw new Error('Failed to get GC Token');
    } catch (e) {
        // API Errors, Axios errors and locally raised errors
        console.log(`ERROR: ${e}`);
        throw e;
    }
}

//#endregion

//#region - Genesys Cloud Platform API - get Active Conversations for User

async function findGCUser(gcRegion, gcToken, inputType, inputId) {
    // Test for undefined, null or empty string
    if (!gcRegion) {
        throw new Error('Unset GC Region');
    }
    if (!gcToken) {
        throw new Error('No GC Token');
    }
    if (!inputType) {
        throw new Error('Missing Input Type');
    }
    if (inputType !== 'USERNAME' && inputType !== 'EMAIL' && inputType !== 'EMPLOYEE_ID') {
        throw new Error('Unsupported Input Type');
    }
    if (!inputId) {
        throw new Error('Missing Input Id');
    }

    try {
        client.setEnvironment(gcRegion);
        client.setAccessToken(gcToken);
        const usersApi = new platformClient.UsersApi(client);

        let fieldName = 'email';
        if (inputType === 'USERNAME') fieldName = 'username';
        else if (inputType === 'EMAIL') fieldName = 'email';
        else if (inputType === 'EMPLOYEE_ID') fieldName = 'hr.employeeId';

        let req_data = {
            "query": [
                {
                    "fields": [
                        fieldName
                    ],
                    "value": inputId,
                    "type": "EXACT"
                },
                {
                    "fields": [
                        "state"
                    ],
                    "type": "EXACT",
                    "values": [
                        "inactive",
                        "active",
                        "deleted"
                    ]
                }
            ],
            "sortOrder": "ASC",
            "pageSize": 25,
            "pageNumber": 1,
            "expand": [
                "presence",
                "routingStatus",
                "employerInfo",
                "conversationSummary",
                "station"
            ]
        };

        const response = await usersApi.postUsersSearch(req_data);

        return response;
    } catch (e) {
        // API Errors, Axios errors and locally raised errors
        console.log(`ERROR: ${e}`);
        throw e;
    }
}

async function findActiveConversationsForGCUser(gcRegion, gcToken, userId, mediaType) {
    // Test for undefined, null or empty string
    if (!gcRegion) {
        throw new Error('Unset GC Region');
    }
    if (!gcToken) {
        throw new Error('No GC Token');
    }
    if (!userId) {
        throw new Error('Missing User ID');
    }
    if (!mediaType) {
        throw new Error('Missing Media Type');
    }

    try {
        client.setEnvironment(gcRegion);
        client.setAccessToken(gcToken);
        const analyticsApi = new platformClient.AnalyticsApi(client);

        let endDate = new Date(Date.now());
        endDate.setHours(endDate.getHours() + 1);
        let startDate = new Date(Date.now());
        startDate.setHours(startDate.getHours() - 30*24 + 1);
        let interval = `${startDate.toISOString()}/${endDate.toISOString()}`;

        let req_data = {};
        if (mediaType === 'ALL') {
            req_data = {
                "conversationFilters": [
                    {
                        "type": "and",
                        "predicates": [
                            {
                                "type": "dimension",
                                "dimension": "conversationEnd",
                                "operator": "notExists"
                            }
                        ]
                    }
                ],
                "segmentFilters": [
                    {
                        "clauses": [
                            {
                                "type": "and",
                                "predicates": [
                                    {
                                        "type": "dimension",
                                        "dimension": "userId",
                                        "operator": "matches",
                                        "value": userId
                                    },
                                    {
                                        "type": "dimension",
                                        "dimension": "segmentEnd",
                                        "operator": "notExists"
                                    },
                                    {
                                        "type": "dimension",
                                        "dimension": "segmentType",
                                        "operator": "matches",
                                        "value": "interact"
                                    }
                                ]
                            }
                        ],
                        "type": "and"
                    }
                ],
                "order": "desc",
                "orderBy": "conversationStart",
                "interval": interval,
                "paging": {
                    "pageSize": 25,
                    "pageNumber": 1
                }
            };
        } else {
            let mediaTypeFilter = mediaType.toLowerCase();
            if (mediaTypeFilter === 'call') mediaTypeFilter = 'voice';
            req_data = {
                "conversationFilters": [
                    {
                        "type": "and",
                        "predicates": [
                            {
                                "type": "dimension",
                                "dimension": "conversationEnd",
                                "operator": "notExists"
                            }
                        ]
                    }
                ],
                "segmentFilters": [
                    {
                        "clauses": [
                            {
                                "type": "and",
                                "predicates": [
                                    {
                                        "type": "dimension",
                                        "dimension": "userId",
                                        "operator": "matches",
                                        "value": userId
                                    },
                                    {
                                        "type": "dimension",
                                        "dimension": "segmentEnd",
                                        "operator": "notExists"
                                    },
                                    {
                                        "type": "dimension",
                                        "dimension": "segmentType",
                                        "operator": "matches",
                                        "value": "interact"
                                    },
                                    {
                                        "type": "dimension",
                                        "dimension": "mediaType",
                                        "operator": "matches",
                                        "value": mediaTypeFilter
                                    }
                                ]
                            }
                        ],
                        "type": "and"
                    }
                ],
                "order": "desc",
                "orderBy": "conversationStart",
                "interval": interval,
                "paging": {
                    "pageSize": 25,
                    "pageNumber": 1
                }
            };
        }

        const response = await analyticsApi.postAnalyticsConversationsDetailsQuery(req_data);

        return response;
    } catch (e) {
        // API Errors, Axios errors and locally raised errors
        console.log(`ERROR: ${e}`);
        throw e;
    }
}

//#endregion

/*
------------------------------------------------------------------------------
* Module Exports
------------------------------------------------------------------------------
*/

module.exports.verifyGCToken = verifyGCToken;
module.exports.requestGCToken = requestGCToken;
module.exports.findGCUser = findGCUser;
module.exports.findActiveConversationsForGCUser = findActiveConversationsForGCUser;
