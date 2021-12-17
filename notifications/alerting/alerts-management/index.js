// >> START alerts-management
const platformClient = require('platformClient');

// Set Genesys Cloud objects
const client = platformClient.ApiClient.instance;

// >> START alerts-management-step-2
const alertingApi = new platformClient.AlertingApi();
// >> END alerts-management-step-2

// Set Genesys Cloud settings
client.setEnvironment('mypurecloud.com');
client.setPersistSettings(true, 'test_app');

// >> START alerts-management-step-1
client.loginImplicitGrant('client-id-here', 'https://localhost/')
// >> END alerts-management-step-1
.then(() => {
    // >> START alerts-management-step-3
    let body = {
        'name': 'tAnswer Greater than 10 Second Alert',
        'dimension': 'queueId',
        'dimensionValue': 'abc123-ab12-12ab-1234-abdcef123456',
        'metric': 'tAnswered',
        'mediaType': 'chat',
        'numericRange': 'gt',
        'statistic': 'count',
        'value': 10,
        'enabled': true,
        'notificationUsers': [
            {
                'id': '1a234bcd-aab2-1de34-2ab3-1a2b3c4d5e'
            }
        ],
        'alertTypes': ['EMAIL']
     }

     return alertingApi.postAlertingInteractionstatsRules(body);
     // >> END alerts-management-step-3
}).then((data) => {
    // Display API response in console and HTML page
    console.log('postAlertingInteractionstatsRules RESPONSE: ' + JSON.stringify(data));
    document.getElementById('create-alert-rule-response').innerText = JSON.stringify(data);
    
    // >> START alerts-management-step-4
    return alertingApi.getAlertingInteractionstatsAlertsUnread();
    // >> END alerts-management-step-4
}).then((data) => {
    // Display API response in console and HTML page
    console.log('getAlertingInteractionstatsAlertsUnread RESPONSE: ' + JSON.stringify(data));
    document.getElementById('unread-alerts-count').innerText = JSON.stringify(data.count);

    // >> START alerts-management-step-5
    if (data.count > 0) {
        alertingApi.getAlertingInteractionstatsAlerts()
        .then((alertList) => {
            // Display API response in console
            console.log('getAlertingInteractionstatsAlerts RESPONSE: ' + JSON.stringify(alertList));

            let alertItem;

            for (alertItem of alertList.entities) {
                let notificationUser;

                for (notificationUser of alertItem.notificationUsers) {
                    // Display API response in console and HTML page
                    document.getElementById('alert-message').innerText = alertItem.name + ' alert on ' + alertItem.dimension + ' ' + alertItem.dimension + ' sent to ' + notificationUser.name;
                    console.log(alertItem.name + ' alert on ' + alertItem.dimension + ' ' + alertItem.dimensionValue + ' sent to ' + notificationUser.name);
                }
            }
        });
    }
    // >> END alerts-management-step-5
}).catch((err) => {
    // Handle failure response
    console.log(err);
});
// >> END alerts-management