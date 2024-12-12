## Data Action Contract and Configuration - Details for Manual Setup

**Name:** "Genesys Function Example - JWE Encrypt and Decrypt with Status"

### Required Custom Credentials (Integration's configuration level)

The example expects some custom credentials at the Genesys Function Data Actions integration level:
* PUBLIC_KEY: Public Key to perform the JWE Encryption
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
    "jweAction",
    "textInput"
  ],
  "properties": {
    "jweAction": {
      "type": "string",
      "description": "Select ENCRYPT or DECRYPT",
      "enum": [
        "ENCRYPT",
        "DECRYPT"
      ]
    },
    "textInput": {
      "description": "Text to process",
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
    "status": {
      "description": "Status of the JWE Encryption or Decryption (false if failed)",
      "type": "boolean"
    },
    "textOutput": {
      "description": "Result of the JWE Encryption or Decryption",
      "type": "string"
    },
    "errorMesssage": {
      "description": "Error Message if JWE Encryption or Decryption failed",
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
  "requestTemplate": "{ \"jweKey\": \"#if($!{input.jweAction} == 'ENCRYPT')$!{credentials.PUBLIC_KEY}#{else}$!{credentials.PRIVATE_KEY}#end\", \"jweAction\": \"$!{input.jweAction}\",  \"textInput\": \"$!{input.textInput}\" }"
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
