# Change SeaweedFS bucket policy
```shell
aws s3api put-bucket-policy --endpoint-url https://s3.sprite3366.com --bucket wedding --policy '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::wedding/album/*"}]}'
aws s3api put-bucket-policy --endpoint-url https://s3.sprite3366.com --bucket wedding --policy '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::wedding/music/*"}]}'
```