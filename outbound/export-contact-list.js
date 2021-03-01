// >> START outbound-export-contact-list This example demostrates initiating an export of a contact list and downloading it
const requestp = require('request-promise');
const platformClient = require('purecloud-platform-client-v2');
const client = platformClient.ApiClient.instance;
client.setEnvironment('Given environment');

const exportContactList = function exportContactList(contactListId) {
    const outboundApi = new platformClient.OutboundApi();
    outboundApi.getOutboundContactlistExport(contactListId, { download: 'false' })
        .then(res => {
            const downloadUri = res.uri;
            return requestp({
                uri: downloadUri,
                headers: {
                    'authorization': `bearer ${client.authData.accessToken}`
                }
            });
        })
        .then(res => {
            console.log('================================== Export Contents ======================================');
            console.log(res);
        })
        .catch((err) => {
            console.log('Failed to export contact list:', err);
            if (err.body && err.body.code === 'no.available.list.export.uri') {
                console.log('Waiting for export...');
                setTimeout(() => exportContactList(contactListId), 5000);
            } else {
            }
        });
};

const clientId = 'Given Client ID';
const clientSecret = 'Given Client secret';
const contactListId = 'Given ContactListId';
client.loginClientCredentialsGrant(clientId, clientSecret)
    .then(() => {
        const outboundApi = new platformClient.OutboundApi();
        outboundApi.postOutboundContactlistExport(contactListId)
            .then(() => exportContactList(contactListId));
    })
    .catch((err) => console.log(err));
// >> END outbound-export-contact-list
