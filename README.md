# aws-cognito-lambda-auth

Cognitoのユーザープールを使った認証について深く学ぶためのリポジトリ


## デプロイ手順

### 1. ビルド
```bash
$ sam build
```

### 2. デプロイ
```bash
$ sam deploy
```

## CFnのStack削除
デプロイしたすべての要素、Lambda、DynamoDB、Cognitoユーザープールなどを削除

```bash
$ aws cloudformation delete-stack --stack-name aws-cognito-lambda-auth-app
```