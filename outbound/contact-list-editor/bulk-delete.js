// >> START bulk-delete This example demonstrates how to bulk delete contacts when specifying an ad-hoc filter
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
    }
};

const bulkDelete = function bulkDelete(contactListId, body) {
    return outboundApi.postOutboundContactlistContactsBulkRemove(contactListId, body);
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

bulkDelete(contactListId, body)
    .then(bulkDeleteResponse => {
        getJobStatus(contactListId, bulkDeleteResponse.id);
    })
    .catch(err => {
        console.log("Error bulk deleting contacts.", err);
    })
// >> END bulk-delete
