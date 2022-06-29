const AWS = require("aws-sdk");
const cognito = new AWS.CognitoIdentityServiceProvider();

const clientId = process.env.CLIENT_ID;

exports.handler = async (event) => {
  console.log("EVENT\n", event);

  if (event.httpMethod !== "POST") {
    console.log("ERROR\n", "httpMethod is not POST");

    const result = {
      error: true,
      code: "InvalidHttpMethod",
      message: `postMethod only accepts POST method, you tried: ${event.httpMethod} method.`,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  }

  console.log("CLIENT_ID\n", clientId);

  const body = JSON.parse(event.body);
  const email = body.email;

  const params = {
    ClientId: clientId, // アプリケーションクライアントのID
    Username: email, // template.yamlより、「UsernameAttributes」は「email」を指定。
  };

  const result = await cognito
    .resendConfirmationCode(params)
    .promise()
    .catch((error) => {
      //
      // ここでcatchされるerrorの例
      //
      // error = {
      //   code: 'InvalidParameterException',
      //   message: 'InvalidParameterException: User is already confirmed.'
      //   time: 2022-06-29T17:23:26.970Z,
      //   requestId: '0daea9a5-b55e-41d8-aa9c-02352abc617b',
      //   statusCode: 400,
      //   retryable: false,
      //   retryDelay: 41.14133366071404
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
  // 成功時のresultの中身例
  //
  // result = {
  //     "CodeDeliveryDetails": {
  //         "AttributeName": "email",
  //         "DeliveryMedium": "EMAIL",
  //         "Destination": "p***@g***"
  //     }
  // }
  //
  //
  // error時のbodyの中身例
  //
  // result = {
  //     "code": "InvalidParameterException",
  //     "error": true,
  //     "message": "User is already confirmed."
  // }
  //

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
