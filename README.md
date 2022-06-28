# aws-cognito-lambda-auth

Cognitoのユーザープールを使った認証について深く学ぶためのリポジトリ


## CFnのStack削除
すべての課金やLambda、DynamoDBの利用を防御する

```bash
$ aws cloudformation delete-stack --stack-name aws-cognito-lambda-auth-app
```