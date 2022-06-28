const AWS = require("aws-sdk");
const cognito = new AWS.CognitoIdentityServiceProvider();

const clientId = process.env.CLIENT_ID;

exports.createUserHandler = async (event) => {
  console.log("EVENT\n", event);

  if (event.httpMethod !== "POST") {
    console.log("ERROR\n", "httpMethod is not POST");
    throw new Error(
      `postMethod only accepts POST method, you tried: ${event.httpMethod} method.`
    );
  }

  console.log("clientId\n", clientId);

  const body = JSON.parse(event.body);
  const email = body.email;
  const password = body.password;

  const params = {
    ClientId: clientId, // アプリケーションクライアントのID
    Username: email, // template.yamlより、「UsernameAttributes」は「email」を指定。
    Password: password, // template.yamlより、PasswordPolicyにてパスワードの複雑性を指定。
    UserAttributes: [{ Name: "email", Value: email }],
  };

  const result = await cognito
    .signUp(params)
    .promise()
    .catch((error) => {
      //
      // errorの例
      //
      // error = {
      //   "code": "InvalidPasswordException",
      //   "message": "Password did not conform with policy: Password not long enough",
      //   "requestId": "07c7eafe-bff7-4777-bc51-a8d4acc8c0dc",
      //   "retryDelay": 38.45781588499835,
      //   "retryable": false,
      //   "statusCode": 400,
      //   "time": "2022-06-27T17:13:05.930Z"
      // }
      //
      console.log("ERROR\n", error);

      return {
        error: true,
        code: error.code,
        message: error.message,
      };
    });

  //
  // 成功時のbodyの中身例
  //
  // {
  //   "CodeDeliveryDetails": {
  //       "AttributeName": "email",
  //       "DeliveryMedium": "EMAIL",
  //       "Destination": "p***@g***"
  //   },
  //   "UserConfirmed": false,
  //   "UserSub": "b2377463-32a0-408b-bcff-9fea229d5990"
  // }
  //
  //
  // error時のbodyの中身例
  //
  // {
  //   "error": "true",
  //   "code": "UsernameExistsException",
  //   "message": "An account with the given email already exists."
  // }
  //

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
