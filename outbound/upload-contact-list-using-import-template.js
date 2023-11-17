// >> START outbound-upload-contact-list-using-import-template This example demonstrates how to upload contact list data using import template
$('document').ready(function () {
    $('#file-input').change(function (event) {
        uploadContacts(event.target.files[0]);
    });
 });
 
 function uploadContacts(file) {
    var data = new FormData();
    // Required
    data.append('importTemplateId', importTemplateId);
    data.append('listNamePrefix', 'Genesys');
    data.append('file', file);
    data.append('fileType', 'contactlist');

    // Optional
    data.append('divisionIdForTargetContactLists', 'division-id'); // If no divisionIdForTargetContactLists is specified, Home division will be used.
    data.append('contact-id-name', 'Contact ID');
 
    $.ajax({
        url: 'https://apps.mypurecloud.com/uploads/v2/contactlist',
        type: 'POST',
        headers: {
            Authorization: 'bearer ' + authToken
        },
        data: data,
        processData: false,
        contentType: false
    });
 }
 // >> END outbound-upload-contact-list-using-import-template
 