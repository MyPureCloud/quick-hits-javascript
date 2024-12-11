## Data Action Contract and Configuration - Details for Manual Setup

**Name:** "Genesys Function Example - Get Active Conversations For User"

### Required Custom Credentials (Integration's configuration level)

The example expects some custom credentials at the Genesys Function Data Actions integration level:
* GC_CLIENT_ID: The Client ID of your Client Credentials OAuth Client
* GC_CLIENT_SECRET: The Client Secret of your Client Credentials OAuth Client
* GC_REGION: the region of your Genesys Cloud org (e.g. mypurecloud.com, mypurecloud.ie)

### Contract

In the Action's Setup tab, select *Contracts*.  
Click on the *JSON* switch (from *Simple* to *JSON* display).

#### Input Contract

```json
{
  "title": "ProcessingRequest",
  "type": "object",
  "required": [
    "inputType",
    "inputId",
    "mediaType"
  ],
  "properties": {
    "inputType": {
      "type": "string",
      "description": "Select USERNAME, EMAIL or EMPLOYEE_ID",
      "enum": [
        "USERNAME",
        "EMAIL",
        "EMPLOYEE_ID"
      ]
    },
    "inputId": {
      "description": "Id - Username, Email or EmployeeId",
      "type": "string"
    },
    "mediaType": {
      "type": "string",
      "description": "Select ALL or CALL, CALLBACK, EMAIL, ...",
      "enum": [
        "ALL",
        "CALL",
        "CALLBACK",
        "EMAIL",
        "MESSAGE",
        "CHAT"
      ]
    }
  },
  "additionalProperties": false
}
```

#### Output Contract

```json
{
  "title": "ProcessingResponse",
  "type": "object",
  "properties": {
    "status": {
      "description": "Status of the request (false if failed)",
      "type": "boolean"
    },
    "userId": {
      "description": "Id of the User",
      "type": "string"
    },
    "userPresence": {
      "description": "Presence of the User",
      "type": "string"
    },
    "userRoutingStatus": {
      "description": "Routing Status of the User",
      "type": "string"
    },
    "nbActiveConversations": {
      "description": "Number of Active Conversations for the User",
      "type": "number"
    },
    "associatedStation": {
      "description": "True if user has an associated station",
      "type": "boolean"
    },
    "activeConversations": {
      "type": "array",
      "items": {
        "title": "ConversationId",
        "type": "string"
      }
    },
    "errorMesssage": {
      "description": "Error Message if the request failed",
      "type": "string"
    }
  },
  "additionalProperties": true
}
```

### Configuration

In the Action's Setup tab, select *Configuration*.  
Click on the *JSON* switch (from *Simple* to *JSON* display).

#### Request Configuration

```json
{
  "requestType": "POST",
  "headers": {
    "x-gc-id": "$!{credentials.GC_CLIENT_ID}",
    "x-gc-secret": "$!{credentials.GC_CLIENT_SECRET}",
    "x-gc-region": "$!{credentials.GC_REGION}"
  },
  "requestTemplate": "{ \"inputType\": \"$!{input.inputType}\",  \"inputId\": \"$!{input.inputId}\",  \"conversationId\": \"$!{input.conversationId}\",  \"mediaType\": \"$!{input.mediaType}\" }"
}
```

#### Response Configuration

```json
{
  "translationMap": {},
  "translationMapDefaults": {},
  "successTemplate": "${rawResult}"
}
```

### Function

In the Action's Setup tab, select *Function*.

The *function_js_axios* and *function_js_gc_sdk* (javascript) versions of the example require:  
**Handler:** "src/index.handler"

The *function_ts_axios* and *function_ts_gc_sdk* (typescript) versions of the example require:  
**Handler:** "dist/index.handler"

**Runtime:** originally built with "nodejs20.x"
