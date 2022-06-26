const AWS = require("aws-sdk");
const cognito = new AWS.CognitoIdentityServiceProvider();

const userPoolId = process.env.USER_POOL_ID;

exports.createUserHandler = async (event) => {
  if (event.httpMethod !== "POST") {
    throw new Error(
      `postMethod only accepts POST method, you tried: ${event.httpMethod} method.`
    );
  }

  // Get id and name from the body of the request
  const body = JSON.parse(event.body);
  const email = body.email;
  const password = body.password;

  // SignUpのパラメーター
  const params = {
    UserPoolId: userPoolId,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email }, // 必要に応じて増減する。
    ],
  };

  // SignUp実行
  const result = await cognito
    .signUp(params)
    .promise()
    .catch((error) => {
      // 必要に応じて例外処理を追加する。
      // 例えば、IDが重複したときの例外は→「error.code == 'UsernameExistsException'」
      throw error;
    });

  // HTTPレスポンス 必要に応じて編集する。
  return {
    statusCode: 200,
  };
};
