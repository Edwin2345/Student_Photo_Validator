import json
import boto3
import os

s3_client = boto3.client('s3')
dynamodb_client = boto3.resource('dynamodb')
validation_table = dynamodb_client.Table(os.environ['TABLE_NAME'])

def lambda_handler(event, context):
    try:
       #Get Filename
       fileName = event['queryStringParameters']['fileName']
       
       #Delete from S3
       s3_response = s3_client.delete_object(
            Bucket=os.environ["BUCKET_NAME"],
            Key=fileName,
        )
       
       #Delete from Dynamo
       dynamo_response = validation_table.delete_item(
           Key={"FileName": fileName}
        )
       
       
       return {"statusCode": 200, "body": "successfully deleted from "+fileName}
    except Exception as e:
       print(e)
       return {"statusCode": 400, "body": "Bad Request to DELETE: images"}