// >> START outbound-contact-bulk-edit This example demonstrates how to bulk edit contacts when specifying an ad-hoc filter
const platformClient = require('purecloud-platform-client-v2');
const client = platformClient.ApiClient.instance;
client.setEnvironment('Given environment');

const outboundApi = new platformClient.OutboundApi();

const contactListId = "f19465cf-5bc6-4871-b59f-5307575ddddf";
const body = {
    criteria: {
        filterType: "AND",
        clauses: [
            {
                filterType: "AND",
                predicates: [
                    {
                        column: "AccountStatus",
                        operator: "EQUALS",
                        value: "Red"
                    },
                    {
                        column: "AmountOwed",
                        operator: "EQUALS",
                        value: "0"
                    }
                ]
            }
        ]
    },
    contact: {
        callable: false,
        data: {
            AccountStatus: "Green"
        }
    }
};

const bulkEdit = function bulkEdit(contactListId, body) {
    return outboundApi.postOutboundContactlistContactsBulkUpdate(contactListId, body);
};

const getJobStatus = function getJobStatus(contactListId, jobId) {
    outboundApi.getOutboundContactlistContactsBulkJob(contactListId, jobId)
        .then(bulkOperationJob => {
            const state = bulkOperationJob.state;
            if (state === "InProgress") {
                console.log("Waiting for job to complete...");
                setTimeout(() => getJobStatus(contactListId, body), 5000);
            } else {
                console.log("Bulk Operation Results:");
                console.log(bulkOperationJob);
            }
        });
};

bulkEdit(contactListId, body)
    .then(bulkEditResponse => {
        getJobStatus(contactListId, bulkEditResponse.id);
    })
    .catch(err => {
        console.log("Error bulk editing contacts.", err);
    })
// >> END outbound-contact-bulk-edit
