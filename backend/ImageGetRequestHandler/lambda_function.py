import json
import boto3
import os

validation_table = boto3.resource("dynamodb").Table(os.environ['TABLE_NAME'])

def lambda_handler(event, context):
    try:
       #Get Result By FileName
       if "queryStringParameters" in event:
           image_file_name = event["queryStringParameters"]["imageName"]
           response =  validation_table.get_item(Key={"FileName": image_file_name})
           
           if 'Item' in response:
               return {"statusCode": 200, "body": json.dumps(response['Item'])}
           else:
               return {"statusCode": 404, "body": json.dumps({"fileNameNotFound": image_file_name})}
               
       #Get All Entries 
       else:
           response = validation_table.scan(
             Limit=20,
             ProjectionExpression='FileName,ValidationResult,FailureReasons,UploadTimestamp'
           )
           print(response)
           return {"statusCode": 200, "body": json.dumps(response['Items'])}
    except Exception as e:
       print(e)
       return {"statusCode": 400, "body": "Bad Request to GET: images"}