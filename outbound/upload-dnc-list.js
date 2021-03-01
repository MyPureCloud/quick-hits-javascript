// >> START outbound-upload-dnc-list This example demonstrates how to upload a DNC list
$('document').ready(function () {
   $('#file-input').change(function (event) {
       uploadDNCLists(event.target.files[0]);
   });
});

function uploadDNCLists(file) {
   var data = new FormData();
   data.append('id', dncListId);
   data.append('file', file);
   data.append('fileType', 'dnclist');
   data.append('phoneColumns', 'PhoneColumnName');

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
// >> END outbound-upload-dnc-list
