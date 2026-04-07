# Setup SeaweedFS bucket policy
```shell
aws s3api put-bucket-policy --endpoint-url http://localhost:8333 --bucket wedding --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::wedding/album/*"
    },
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::wedding/music/*"
    }
  ]
}'

#check current policy
aws s3api get-bucket-policy --endpoint-url http://localhost:8333 --bucket wedding
```