import json
import os
import uuid
import datetime
import boto3
from face_details_threshold import FACE_DETAILS_THRESHOLDS
from face_details_threshold import FAILURE_REASONS

rekognition_client = boto3.client('rekognition')
dynamodb_client = boto3.resource('dynamodb')
validation_table = dynamodb_client.Table(os.environ['TABLE_NAME'])
BUCKET_NAME = os.environ['BUCKET_NAME']


def extract_file_name(event):
    return event["Records"][0]["s3"]["object"]["key"]
    
    
def detect_faces(file_name):
    return rekognition_client.detect_faces(
    Image={
        'S3Object': {
            'Bucket': BUCKET_NAME,
            'Name': file_name
        }
    },
    Attributes=['ALL']
    )



def extract_face_details(result):
    parsed_response = {} 
    face = result["FaceDetails"][0]

    for key, value in FACE_DETAILS_THRESHOLDS.items():
        parsed_response[key] = face[key]
        
    return parsed_response
    


def validate_face( face_details ):
    evaluation_result = {"result": "PASS", "failure_reasons": []}
    
    for key,value in FACE_DETAILS_THRESHOLDS.items():
        property_is_valid = True
        
        #Check if face property is valid
        if( face_details[key]["Value"] != FACE_DETAILS_THRESHOLDS[key]["desiredValue"] ):
            print(f"Expected != Actual. FaceAttribute: {key} has a value: {face_details[key]['Value']}, but requires {FACE_DETAILS_THRESHOLDS[key]['desiredValue']}")
            property_is_valid = False
           
        #Check if confidence level is met
        if( face_details[key]["Confidence"] < FACE_DETAILS_THRESHOLDS[key]["minConfidence"]):
            print(f"Confidence is lower than minimum threshold. FaceAttribute: {key} has a confidence value: {face_details[key]['Confidence']}, but must be greater than {FACE_DETAILS_THRESHOLDS[key]['minConfidence']}")
            property_is_valid = False
        
        if not property_is_valid:
            evaluation_result["result"] = "FAIL"
            evaluation_result["failure_reasons"].append(FAILURE_REASONS[key])
           
    return evaluation_result
    


def write_result_to_db(evaluation_result, file_name, face_details):

    item_attributes = {
        'FileName': file_name,
        'ValidationResult': evaluation_result['result'],
        'FailureReasons': json.dumps(evaluation_result['failure_reasons']),
        'UploadTimestamp': datetime.datetime.now().replace(microsecond=0).isoformat(),
        'FileLocation': "https://" + BUCKET_NAME + ".s3.amazonaws.com" + "/" + file_name,
        'FaceDetails': json.dumps(face_details)
    }
    
    response = validation_table.put_item(Item=item_attributes)
    if response['ResponseMetadata']['HTTPStatusCode'] == 200:
        print('Item added to table successfully!')
    else:
        print('Error adding item to table.')
    
    
    
def lambda_handler(event, context):
    #Get File name
    current_file_name = extract_file_name(event)
   
    #Call Rekognition DetectFaces API and Extract face Details
    detect_face_res = detect_faces( current_file_name )
    face_details = extract_face_details( detect_face_res )
    
    #Validate to see if thresholds are met
    face_evaluation_result = validate_face( face_details )
    
    #Write results to DB
    write_result_to_db(face_evaluation_result, current_file_name, face_details)
    
    #Pipe result to sns using destinations
    publish_object = {
        "FileName": current_file_name,
        "ValidationResult": face_evaluation_result["result"],
        "FailureReasons": json.dumps(face_evaluation_result['failure_reasons']),
        "FileLocation": "https://" + BUCKET_NAME + ".s3.amazonaws.com" + "/" + current_file_name
    }
    
    return {
        "statusCode": 200,
        "body": json.dumps(publish_object)
    }