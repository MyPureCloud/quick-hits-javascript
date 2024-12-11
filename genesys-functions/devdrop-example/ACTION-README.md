## Data Action Contract and Configuration - Details for Manual Setup

**Name:** "Genesys Function Customer Example"

### Contract

In the Action's Setup tab, select *Contracts*.  
Click on the *JSON* switch (from *Simple* to *JSON* display).

#### Input Contract

```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "input1String": {
      "description": "Example string input",
      "type": "string"
    },
    "input2Boolean": {
      "description": "Example boolean input",
      "type": "boolean"
    },
    "input3Number": {
      "description": "Example number input",
      "type": "number"
    }
  },
  "additionalProperties": false
}
```

#### Output Contract

```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "echoInput1": {
      "description": "Echo of example string input",
      "type": "string"
    },
    "echoInput2": {
      "description": "Echo of example boolean input",
      "type": "boolean"
    },
    "echoInput3": {
      "description": "Echo of example number input",
      "type": "number"
    },
    "certificateLength": {
      "description": "Length in bytes of the certificate value. Zero if no certificate found.",
      "type": "number"
    },
    "passwordLength": {
      "description": "Length in bytes of the password. Zero if no password found.",
      "type": "number"
    }
  },
  "additionalProperties": false
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
    "UserAgent": "PureCloudIntegrations/1.0",
    "x-credentialsExamplePassword": "$!{credentials.example_password}"
  },
  "requestTemplate": "{ \"certificate\": \"$!{credentials.example_certificate_base64}\",\n  \"input1String\": \"$!{input.input1String}\",\n  \"input2Boolean\": $!{input.input2Boolean} \n#if( \"$!{input.input3Number}\" != \"\" )\n  ,  \"input3Number\": ${input.input3Number}\n#end\n}"
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

The example requires:  
**Handler:** "src/index.handler"

**Runtime:** originally built with "nodejs20.x"
