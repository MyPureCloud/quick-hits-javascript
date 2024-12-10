'use strict';

// Import needed built in and external libraries.
const axios = require('axios');

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
        let req_url = `https://api.${gcRegion}/api/v2/tokens/me`;
        let req_method = 'HEAD';
        let auth_header = {
            'Authorization': `Bearer ${gcToken}`
        };
        let request = {
            method: req_method,
            url: req_url,
            timeout: HTTP_REQ_TIMEOUT,
            max_redirects: 0,
            headers: auth_header
        };

        const response = await axios.request(request);

        if (response.status >= 200 && response.status < 300) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        // Axios errors and locally raised errors
        console.log(`ERROR: ${e}`);
        throw e;
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
        let req_url = `https://login.${gcRegion}/oauth/token`;
        let req_method = 'POST';
        let authHeaderValue = Buffer.from(`${gcClientId}:${gcClientSecret}`).toString('base64');
        let auth_header = {
            'Authorization': `Basic ${authHeaderValue}`
        };

        let request = {
            method: req_method,
            url: req_url,
            timeout: HTTP_REQ_TIMEOUT,
            max_redirects: 0,
            headers: auth_header,
            data: 'grant_type=client_credentials'
        };

        const response = await axios.request(request);

        if (response.status >= 200 && response.status < 300) {
            if (response.data && response.data['access_token']) {
                return response.data['access_token'];
            }
        }
        throw new Error('Failed to get GC Token');
    } catch (e) {
        // Axios errors and locally raised errors
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
        let req_url = `https://api.${gcRegion}/api/v2/users/search`;
        let req_method = 'POST';
        let req_headers = {
            'Authorization': `Bearer ${gcToken}`,
            'Content-Type': `application/json`
        };

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

        let request = {
            method: req_method,
            url: req_url,
            timeout: HTTP_REQ_TIMEOUT,
            max_redirects: 0,
            headers: req_headers,
            data: req_data
        };

        const response = await axios.request(request);

        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            throw new Error('Failed to find user');
        }
    } catch (e) {
        // Axios errors and locally raised errors
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
        let req_url = `https://api.${gcRegion}/api/v2/analytics/conversations/details/query`;
        let req_method = 'POST';
        let req_headers = {
            'Authorization': `Bearer ${gcToken}`,
            'Content-Type': `application/json`
        };

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

        let request = {
            method: req_method,
            url: req_url,
            timeout: HTTP_REQ_TIMEOUT,
            max_redirects: 0,
            headers: req_headers,
            data: req_data
        };

        const response = await axios.request(request);

        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            throw new Error('Failed to find conversations');
        }
    } catch (e) {
        // Axios errors and locally raised errors
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
