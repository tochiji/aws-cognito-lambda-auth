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
  const confirmCode = body.confirmCode;

  const params = {
    ClientId: clientId, // アプリケーションクライアントのID
    Username: email, // template.yamlより、「UsernameAttributes」は「email」を指定。
    ConfirmationCode: confirmCode,
  };

  const result = await cognito
    .confirmSignUp(params)
    .promise()
    .catch((error) => {
      //
      // ここでcatchされるerrorの例
      //
      // error = {
      //   code: 'CodeMismatchException',
      //   message: "CodeMismatchException: Invalid verification code provided, please try again."
      //   time: 2022-06-29T16:39:58.711Z,
      //   requestId: 'ad8cf9e6-1d65-4551-9df6-e4c532e9aa1e',
      //   statusCode: 400,
      //   retryable: false,
      //   retryDelay: 66.79188286087705
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
  // {}
  //
  //
  // error時のbodyの中身例
  //
  // {
  //     "code": "MissingRequiredParameter",
  //     "error": true,
  //     "message": "Missing required key 'ConfirmationCode' in params"
  // }
  //
  // {
  //     "code": "CodeMismatchException",
  //     "error": true,
  //     "message": "Invalid verification code provided, please try again."
  // }
  //
  // {
  //     "code": "NotAuthorizedException",
  //     "error": true,
  //     "message": "User cannot be confirmed. Current status is CONFIRMED"
  // }
  //

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
