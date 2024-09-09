import json
import os
import base64
import boto3
import io

s3_client = boto3.client('s3')

def get_content_type(fileName):
    extension  = fileName.split(".")[1]
    if(extension == 'jpg' or extension == 'jpeg'):
        return 'image/jpeg'
    elif(extension == 'png'):
        return 'image/png'
    else:
        raise Exception("invalid file type")
        

def lambda_handler(event, context):
    try:
        #Get filename and binary image from request
        fileName = event['queryStringParameters']['fileName']  
        binaryImage = base64.b64decode(event['body'])
        
        print(binaryImage)
     
        #Get content type from filename
        contentType = get_content_type( fileName )

        
        #Upload to s3 
        response = s3_client.put_object(
            Bucket=os.environ["BUCKET_NAME"],
            Body=io.BytesIO(binaryImage),
            ContentType=contentType,
            Key=fileName,
        )
        
        return {"statusCode": 200, "body": json.dumps(fileName)}
    except Exception as e:
        print(e)
        return {"statusCode": 400, "body": 'Bad request to POST: image/upload'}
