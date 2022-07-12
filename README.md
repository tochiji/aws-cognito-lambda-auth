# aws-cognito-lambda-auth

Cognitoのユーザープールを使った認証について深く学ぶためのリポジトリ。

CORSの設定もしています。


## デプロイ手順

### 1. ビルド
```bash
$ sam build
```

### 2. デプロイ
`sam deploy`後、`[y/N]`を選択する必要があるので`y`と入力して続行します。

```bash
$ sam deploy

...

------------------------------------------------------------------------
CloudFormation outputs from deployed stack
------------------------------------------------------------------------
Outputs
------------------------------------------------------------------------
Key                 WebEndpoint
Description         API Gateway endpoint URL for Prod
stage
Value               https://XXXXXXXXXXX.execute-api.ap-northeast-1.amazonaws.com/Prod/
------------------------------------------------------------------------

Successfully created/updated stack - aws-cognito-lambda-auth-app in ap-northeast-1
```

完了したらAPI Gatewayのエンドポイントが表示されます。

この後の例は `export URL=https://XXXXXX...` とエンドポイントを環境変数に格納してから実行してください。

## 認証周りの実行

### 1. ユーザーの追加(create-user)
```bash
$ http $URL/auth/create-user email=test@example.com password="XXXXXXXXX"

HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 171
Content-Type: application/json
Date: Sun, 03 Jul 2022 17:14:10 GMT
Via: 1.1 2ba4fa17a6520457d85279d22c861050.cloudfront.net (CloudFront)
X-Amz-Cf-Id: 2VH1ZpGjlkUAXy_f-nzeeelitJ2Jx8pus3pFJiQdqnJv_eY2ifVl1Q==
X-Amz-Cf-Pop: NRT12-C4
X-Amzn-Trace-Id: Root=1-62c1ce61-561bc3542afbcd3d5f1d95a3;Sampled=0
X-Cache: Miss from cloudfront
x-amz-apigw-id: Us0vSEhKNjMFneg=
x-amzn-RequestId: f04ca5d9-57b9-433c-89b9-351229d210ac

{
    "CodeDeliveryDetails": {
        "AttributeName": "email",
        "DeliveryMedium": "EMAIL",
        "Destination": "t***@e***"
    },
    "UserConfirmed": false,
    "UserSub": "3d419b95-a45b-4a4a-8c1d-8945c0949aa4"
}
```

### 2. Eメールアドレスの確認(confirm-signup)
登録した際に送られてくるメールにある認証コードを送信。

```bash
$ http $URL/auth/confirm-signup email=test@example.com confirmCode=9999

HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 2
Content-Type: application/json
Date: Sun, 03 Jul 2022 17:17:05 GMT
Via: 1.1 9997742b01c06cc7d58bb07736bc8a28.cloudfront.net (CloudFront)
X-Amz-Cf-Id: CJUg1gbARORy8awE4bU2vAg_1Cxdw7nmBguQPRbnDoCtmOl0BrFbbw==
X-Amz-Cf-Pop: NRT12-C4
X-Amzn-Trace-Id: Root=1-62c1cf0f-6a109da91ec379330b325611;Sampled=0
X-Cache: Miss from cloudfront
x-amz-apigw-id: Us1KcF4YNjMFrYw=
x-amzn-RequestId: edde48b1-4f3f-426e-baf0-ce2ae326306f

{}

```

### 3. IdTokenの発行(initiate-auth)
```bash
$ http $URL/auth/initiate-auth email=test@example.com password="XXXXXX"

HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 1134
Content-Type: application/json; charset=utf-8
Date: Sun, 03 Jul 2022 17:19:16 GMT
Via: 1.1 57cd4fd5b706e8c375426ad241a2471e.cloudfront.net (CloudFront)
X-Amz-Cf-Id: MceteIso4wOlum5talgaDDKzwQlAFes069B0SygoUhHqwPGF9AznPg==
X-Amz-Cf-Pop: NRT12-C4
X-Amzn-Trace-Id: Root=1-62c1cf92-077e2b7e6cc9893511e4d63f;Sampled=0
X-Cache: Miss from cloudfront
x-amz-apigw-id: Us1e7FGXtjMFlUw=
x-amzn-RequestId: e3c931c9-d0c3-44a0-b378-c9638008279c

{
    "ExpiresIn": 3600,
    "IdToken": "eyJraXXXXXX..."
}
```

この後の例では、`export TOKEN="eyJra...` とIdTokenを環境変数に格納してから実行してください。

### 4. IdTokenの検証
```bash
 $ http https://pvvsytwlpa.execute-api.ap-northeast-1.amazonaws.com/Prod/auth/verify-id-token idToken="eyJra..."
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 499
Content-Type: application/json
Date: Mon, 11 Jul 2022 15:52:21 GMT
Via: 1.1 9f33503b283951bb0144294de8e3cc76.cloudfront.net (CloudFront)
X-Amz-Cf-Id: y1ibkQbIJdltFWUu4R7HK3UcPBtoAqOYdT1C7bVtNg2ds7tDhh8w1w==
X-Amz-Cf-Pop: NRT57-C3
X-Amzn-Trace-Id: Root=1-62cc4734-2e8448237562d2d94472669a;Sampled=0
X-Cache: Miss from cloudfront
x-amz-apigw-id: VHAQPHqYtjMF9Ww=
x-amzn-RequestId: fdd80024-08f6-436e-b1e0-c15590836fbf

{
    "aud": "1ebxxxxxxxxxxxxxxxxxxx", # アプリケーションクライアントID
    "auth_time": 1657554704,
    "cognito:username": "15fc61dd-d919-4188-bd78-e8ce89021e76",
    "email": "XXXXXXXXXXXXX@XXXXX.XXX",
    "email_verified": true,
    "event_id": "d400d70e-9e7a-4171-a5d9-e3b1d2180938",
    "exp": 1657558304,
    "iat": 1657554704,
    "iss": "https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_XXXXXXXX",
    "jti": "9a5ba17c-4ac7-433f-bf16-1e81cef6949f",
    "origin_jti": "7183605d-4323-45bb-b4fa-48463c0abda7",
    "sub": "15fc61dd-d919-4188-bd78-e8ce89021e76",
    "token_use": "id"
}
```

## DynamoDBへのアクセス

### 1. DynamoDBのデータを取得
ここからは、`Header`として`Authorization:$TOKEN` を指定してください。

#### TOKENが存在する場合
```bash
$ http $URL Authorization:$TOKEN

HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 40
Content-Type: application/json
Date: Sun, 03 Jul 2022 17:25:23 GMT
Via: 1.1 0c2ca767ecc2f5a180d1781f16f1e2f2.cloudfront.net (CloudFront)
X-Amz-Cf-Id: wetqCPBobQfmlWDBAvDZdn59atUe_LTG1CjX1XAFQAvw4-bJR_RBtg==
X-Amz-Cf-Pop: NRT12-C4
X-Amzn-Trace-Id: Root=1-62c1d102-4ea99cea6ff108333b04a4c2;Sampled=0
X-Cache: Miss from cloudfront
x-amz-apigw-id: Us2YXHNINjMFsZw=
x-amzn-RequestId: fa367f4a-4b19-45ab-bd23-f1d2a017dd45

[
    {
        "id": "tochiji",
        "name": "Ken Horiuchi"
    }
]
```

#### TOKENが存在しない場合
```bash
 $ http $URL

HTTP/1.1 401 Unauthorized
Connection: keep-alive
Content-Length: 26
Content-Type: application/json
Date: Sun, 03 Jul 2022 17:25:39 GMT
Via: 1.1 2ba4fa17a6520457d85279d22c861050.cloudfront.net (CloudFront)
X-Amz-Cf-Id: RCuIxGqPdk-fzxPWJPpy3jhDN18JErkgKWolTs2aZTV3mI9Ul3OIWw==
X-Amz-Cf-Pop: NRT12-C4
X-Cache: Error from cloudfront
x-amz-apigw-id: Us2bEEvrtjMFY2Q=
x-amzn-ErrorType: UnauthorizedException
x-amzn-RequestId: 6ec67ef2-3fef-4acc-b249-6053a7a1ff24

{
    "message": "Unauthorized"
}

```

### 2. DynamoDBにデータを追加
```bash
$ http $URL Authorization:$TOKEN id="well-known" name="Kirin Kawachima"

HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 44
Content-Type: application/json
Date: Sun, 03 Jul 2022 17:27:50 GMT
Via: 1.1 0a3f9dcf3b4ff75d26bebebd94a52e86.cloudfront.net (CloudFront)
X-Amz-Cf-Id: rncwuHde0hnjW3HGXXYxS8No-AOOa4CGKc5ueaSTkPsjDMv5H52Vdw==
X-Amz-Cf-Pop: NRT12-C4
X-Amzn-Trace-Id: Root=1-62c1d195-6f6c297d0dceceed675013e4;Sampled=0
X-Cache: Miss from cloudfront
x-amz-apigw-id: Us2vYFKGtjMFy6g=
x-amzn-RequestId: 139ec809-9563-4082-8a0e-262b3a070ae7

{
    "id": "well-known",
    "name": "Kirin Kawachima"
}
```

### 3. キーを指定してDynamoDBからデータを取得
```bash
$ http $URL/well-known Authorization:$TOKEN

HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 44
Content-Type: application/json
Date: Sun, 03 Jul 2022 17:29:48 GMT
Via: 1.1 839de761badea2aa0a28c5970b81514c.cloudfront.net (CloudFront)
X-Amz-Cf-Id: FCP3YA0YPwfR74VUfywg-2sXNlprO5Na94UFCrlFjmfWWCT2orSU-w==
X-Amz-Cf-Pop: NRT12-C4
X-Amzn-Trace-Id: Root=1-62c1d20b-52e5cf7863ce538e7a9a9420;Sampled=0
X-Cache: Miss from cloudfront
x-amz-apigw-id: Us3BzHByNjMFf1A=
x-amzn-RequestId: dd8fc480-0477-4a69-aa3d-7310803f930b

{
    "id": "well-known",
    "name": "Kirin Kawachima"
}
```


## 環境の削除手順

### CFnのStack削除
デプロイしたすべての要素、Lambda、DynamoDB、Cognitoユーザープールなどを削除。

```bash
$ aws cloudformation delete-stack --stack-name aws-cognito-lambda-auth-app
```

### CFnのStack確認
しっかり消えているか確認しましょう。

```bash
$ aws cloudformation describe-stacks --query 'Stacks[].StackName' --output text
```