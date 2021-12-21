// >> START user-management
const platformClient = require('purecloud-platform-client-v2');

platformClient.ApiClient.instance.authentications['PureCloud Auth'].accessToken = '';

var apiInstance = new platformClient.UsersApi();

// >> START user-management-step-1
var newuser = { 
    name: "Tutorial User", 
    email: "tutorial378@example.com",
    password: "230498wkjdf8asdfoiasdf"
};

apiInstance.postUsers(newuser)
// >> END user-management-step-1
  .then(function(currentuser) {
    console.log(currentuser.id);
    // >> START user-management-step-2
    var updateUser = {
        version: currentuser.version,
        name: "Tutorial User New Name",
        addresses:[
            {
                address: "3172222222",
                mediaType: "PHONE",
                type: "WORK"
            }
        ]
    };

    apiInstance.patchUser(currentuser.id, updateUser).catch(function(err) {
    // >> END user-management-step-2
        console.error(err);
    });

  })
  .catch(function(err) {
  	console.error(err);
  });
  // >> END user-management