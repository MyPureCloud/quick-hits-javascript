// >> START outbound-upload-contact-list This example demonstrates uploading contact list data
$('document').ready(function () {
   $('#file-input').change(function (event) {
       uploadContacts(event.target.files[0]);
   });
});

function uploadContacts(file) {
   var data = new FormData();
   data.append('id', contactListId);
   data.append('file', file);
   data.append('fileType', 'contactlist');
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
// >> END outbound-upload-contact-list
