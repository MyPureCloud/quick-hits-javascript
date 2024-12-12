## Data Action Contract and Configuration - Details for Manual Setup

**Name:** "Genesys Function Example - JWE Decrypt"

### Required Custom Credentials (Integration's configuration level)

The example expects some custom credentials at the Genesys Function Data Actions integration level:
* PRIVATE_KEY: Private Key to perform the JWE Decryption

### Contract

In the Action's Setup tab, select *Contracts*.  
Click on the *JSON* switch (from *Simple* to *JSON* display).

#### Input Contract

```json
{
  "title": "ProcessingRequest",
  "type": "object",
  "required": [
    "textInput"
  ],
  "properties": {
    "textInput": {
      "description": "Text to Decrypt",
      "type": "string"
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
    "textOutput": {
      "description": "Result of the JWE Decryption",
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
  "headers": {},
  "requestTemplate": "{ \"jweKey\": \"$!{credentials.PRIVATE_KEY}\", \"textInput\": \"$!{input.textInput}\" }"
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

The *function_js* (javascript) version of the example requires:  
**Handler:** "src/index.handler"

The *function_ts* (typescript) version of the example requires:  
**Handler:** "dist/index.handler"

**Runtime:** originally built with "nodejs20.x"
