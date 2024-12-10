# Customer Example NodeJs

This is an example intended for customers to experience setting up a Function.
It demonstrates the following details of using Genesys Function Data Actions:

1. Suggested way of passing a certificate from Action by including as attribute of the body.
2. Passing a value as a clientContext from setting headers in the action.
3. Using inputs passed from the body of the request.
4. Creating a response and returning it.
5. Use of callback for error handling.
6. Use of console.log() to output JSON formated log output.
7. Conditional inputs in requestTemplate which allows for null numeric inputs.

#### Install Serverless

```bash
$ npm install -g serverless@3
```

Use Serverless to package the function in src/index.js with a handler exported as "src/index.handler".

#### Serverless Package

```bash
$ cd customer-example-nodejs
$ npm install -g serverless@3
```

Package will be in .serverless as function-customer-example-nodejs.zip

On MAC ".serverless" might will be a hidden directory, use "ls -al" to see in terminal, or (shift-cmd-period) to see in finder.

