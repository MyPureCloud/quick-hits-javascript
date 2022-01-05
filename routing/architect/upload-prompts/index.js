// >> START upload-prompts Guide on creating a prompt and uploading the media wav file
const platformClient = require('purecloud-platform-client-v2');
const fs = require('fs');
const axios = require('axios');   
const FormData = require('form-data');

// >> START upload-prompts-step-1
// Get client credentials from environment variables
const CLIENT_ID = process.env.GENESYS_CLOUD_CLIENT_ID;
const CLIENT_SECRET = process.env.GENESYS_CLOUD_CLIENT_SECRET;
const ORG_REGION = process.env.GENESYS_CLOUD_REGION; // eg. us_east_1

// Set Genesys Cloud objects
const client = platformClient.ApiClient.instance;
const architectApi = new platformClient.ArchitectApi();

// Set environment
const environment = platformClient.PureCloudRegionHosts[ORG_REGION];
if(environment) client.setEnvironment(environment);

// Authenticate with Genesys Cloud
client.loginClientCredentialsGrant(CLIENT_ID, CLIENT_SECRET)
	.then(() => {
		console.log('Authenticated with Genesys Cloud');
// >> END upload-prompts-step-1
		// >> START upload-prompts-step-2
		// Create new prompt
		console.log('Creating new prompt...');
		return architectApi.postArchitectPrompts({ 
				name: 'uploaded_prompt',
				description: 'Prompt uploaded by upload-prompts example app'
		});
	})
	.then((prompt) => {
		console.log(prompt);
		// >> END upload-prompts-step-2
		// >> START upload-prompts-step-3
		// Create prompt resource for english
		console.log('Creating prompt resource...');
		return architectApi.postArchitectPromptResources(prompt.id, { 
				language: 'en-us'
		});
	})
		// >> END upload-prompts-step-3
	// >> START upload-prompts-step-4
	.then((promptResource) => {
		console.log(promptResource);
		console.log('Uploading prompt...');

		const form = new FormData();
		form.append('file', fs.createReadStream('../prompt-example.wav'));

		return axios.post(promptResource.uploadUri, form, {
			headers: {
				'Authorization': 'bearer ' + client.authData.accessToken,
				...form.getHeaders()
			}
		});
	})
	.then((res) => {
		console.log('Upload complete. Review your prompt in architect.');
		console.log('https://apps.mypurecloud.com/architect/#/call/userprompts');
		console.log(res.data);
	})
	// >> END upload-prompts-step-4
	.catch((err) => console.log(err));
// >> END upload-prompts
