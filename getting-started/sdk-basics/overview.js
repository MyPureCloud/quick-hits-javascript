// >> START sdk-overview This example demonstrates authorizing using an implicit grant and getting authorization permissions
//Load Genesys Cloud and create the ApiClient Instance
const platformClient = require('purecloud-platform-client-v2');
const client = platformClient.ApiClient.instance;
// Create API instance
var authorizationApi = new platformClient.AuthorizationApi();

// Authenticate
client.loginImplicitGrant(clientId, redirectUri)
  .then(function()
    // Make request to GET /api/v2/authorization/permissions
    return authorizationApi.getAuthorizationPermissions();
  })
  .catch(function(response) {
    // Handle failure response
    console.log(`${response.status} - ${response.error.message}`);
    console.log(response.error);
  });
// >> END sdk-overview
