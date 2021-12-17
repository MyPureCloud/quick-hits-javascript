// >> START premium-wizard-step-1
export default {
    // >> START premium-wizard-step-2
    clientID: 'fd2ba742-446f-46c5-bbbc-1cad2f34ac3a',
    // >> END premium-wizard-step-2

    // >> START premium-wizard-step-3
    // 'wizardUriBase': 'http://localhost:8080/wizard/',
    'wizardUriBase': 'https://mypurecloud.github.io/purecloud-premium-app/wizard/',

    // The actual URL of the landing page of your web app.
    // 'premiumAppURL': 'http://localhost:8080/premium-app-sample/index.html',
    'premiumAppURL': 'https://mypurecloud.github.io/purecloud-premium-app/premium-app-sample/index.html',
    // >> END premium-wizard-step-3

    // >> START premium-wizard-step-4
    // Genesys Cloud assigned name for the premium app
    // This should match the integration type name of the Premium App
    'appName': 'premium-app-example',
    // >> END premium-wizard-step-4

    // >> START premium-wizard-step-5
    // Default Values for fail-safe/testing. Shouldn't have to be changed since the app
    // must be able to determine the environment from the query parameter 
    // of the integration's URL
    'defaultPcEnvironment': 'mypurecloud.com',
    'defaultLanguage': 'en-us',

    // The names of the query parameters to check in 
    // determining language and environment
    // Ex: www.electric-sheep-app.com?language=en-us&environment=mypurecloud.com
    'languageQueryParam': 'language',
    'pureCloudEnvironmentQueryParam': 'environment',

    // Permissions required for running the Wizard App
    'setupPermissionsRequired': ['admin'],
    // >> END premium-wizard-step-5

    // >> START premium-wizard-step-6
    // To be added to names of Genesys Cloud objects created by the wizard
    'prefix': 'PREMIUM_EXAMPLE_',
    // >> END premium-wizard-step-6

    // >> START premium-wizard-step-7
    // These are the Genesys Cloud items that will be added and provisioned by the wizard
    'provisioningInfo': {
        'role': [
            {
                'name': 'Role',
                'description': 'Generated role for access to the app.',
                'permissionPolicies': [
                    {
                        'domain': 'integration',
                        'entityName': 'examplePremiumApp',
                        'actionSet': ['*'],
                        'allowConditions': false
                    }
                ]
            }
        ],
        'group': [
            {
                'name': 'Supervisors',
                'description': 'Supervisors have the ability to watch a queue for ACD conversations.',
            }
        ],
        'app-instance': [
            {
                'name': 'Partner Enablement Tools',
                'url': 'https://genesysappfoundry.github.io/partner-enablement-tools/',
                'type': 'standalone',
                'groups': ['Supervisors']
            }
        ],
        'oauth-client': [
            {
                'name': 'OAuth Client',
                'description': 'Generated Client that\'s passed to the App Backend',
                'roles': ['Role'],
                'authorizedGrantType': 'CLIENT_CREDENTIALS',

                /**
                 * This function is for other processing that needs
                 * to be done after creating an object.
                 * 'finally' is available for all the other
                 * resources configured in this config file.
                 * NOTE: Finally functions must return a Promise.
                 * For Client Credentials, normally it means
                 * passing the details to the backend.
                 * @param {Object} installedData the Genesys Cloud resource created
                 * @returns {Promise}    
                 */
                'finally': function(installedData){
                    return new Promise((resolve, reject) => {
                        console.log('Fake Sending Credentials...');
                        setTimeout(() => resolve(), 2000);
                    });
                }
            }
        ]
    }
    // >> END premium-wizard-step-7
};
// >> END premium-wizard-step-1
