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
  const password = body.password;

  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: clientId, // アプリケーションクライアントのID
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };

  //
  // Response Syntax
  // https://docs.aws.amazon.com/ja_jp/cognito-user-identity-pools/latest/APIReference/API_InitiateAuth.html
  //
  // 正常なレスポンス
  //
  const result = await cognito
    .initiateAuth(params)
    .promise()
    .catch((error) => {
      //
      // ここでcatchされるerrorの例
      //
      // error = {
      //   code: 'NotAuthorizedException',
      //   message: 'NotAuthorizedException: Incorrect username or password.',
      //   time: 2022-06-30T17:48:16.243Z,
      //   requestId: '1f1acd96-1545-413a-a223-cfeb641e9ba5',
      //   statusCode: 400,
      //   retryable: false,
      //   retryDelay: 62.12333930957723
      // }
      //
      console.log("ERROR\n", error);

      return {
        error: true,
        code: error.code,
        message: error.message,
      };
    });

  if (result?.error) {
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  }

  const IdToken = result.AuthenticationResult.IdToken;
  const ExpiresIn = result.AuthenticationResult.ExpiresIn;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Set-Cookie": `IdToken=${IdToken}; Max-Age=${ExpiresIn}`,
    },
    body: JSON.stringify({
      IdToken,
      ExpiresIn,
    }),
  };
};
