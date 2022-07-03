const { CognitoJwtVerifier } = require("aws-jwt-verify");

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USERPOOL_ID,
  tokenUse: "id",
  clientId: process.env.CLIENT_ID,
});

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const accessToken = body.idToken;

  let payload;
  try {
    payload = await jwtVerifier.verify(accessToken);
  } catch (error) {
    console.log("ERROR\n", error);
    payload = {
      error: true,
      code: error.code,
      message: error.message,
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(payload),
  };
};
