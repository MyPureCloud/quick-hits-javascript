// >> START contact-search This example demonstrates how to search for contacts matching an existing filter, sorted by a column
const platformClient = require('purecloud-platform-client-v2');
const client = platformClient.ApiClient.instance;
client.setEnvironment('Given environment');

const contactListId = "f19465cf-5bc6-4871-b59f-5307575ddddf";
const body = {
    pageNumber: 1,
    pageSize: 25,
    contactListFilterId: "af337a23-f1ac-4a51-b1dc-393cd72c2957",
    contactSorts: [
        {
            fieldName: "Age",
            direction: "DESC",
            numeric: true
        }
    ]
};

const searchContacts = function searchContacts(contactListId, body) {
    const outboundApi = new platformClient.OutboundApi();

    outboundApi.postOutboundContactlistContactsSearch(contactListId, body)
        .then(res => {
            console.log(res.entities); // List of contacts found
            console.log(res.total); // Number of contacts that match the filter
            console.log(res.contactsCount); // Count of all contacts in the contact list
        })
        .catch((err) => {
            console.log('Failed to search for contacts', err);
        });
};

searchContacts(contactListId, body);
// >> END contact-search
