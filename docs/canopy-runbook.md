---
id: canopy-runbook
title: Runbook
sidebar_label: Runbook
slug: /canopy/runbook
---


This document is a general guide for troubleshooting problems in production
and administrating the production environment.


```
make help
```

## DynamoDB Table Column Modifications/Additions
If there ever comes a time where you need to add a column or modify a columns value in DynamoDB, use the code below. It will add/modify the column with the given **ExpressionAttributeNames** and apply the value given in **ExpressionAttributeValues** to this column in every row of the table. 

```
import json
import boto3
import csv
###This function can be used and manually "tested" to add/update new "column" in dyamodb

def lambda_handler(event, context):
    region = 'us-east-2'
    dynamodb = boto3.client('dynamodb', region_name=region)
    table_name = 'Cognito-users'
    partion_key = 'sf_id'
    sort_key = 'user_id'
    

    dynamodb = boto3.client('dynamodb')

    #get all records from the able
    response = dynamodb.scan(
                            TableName=table_name,
                            AttributesToGet=[partion_key,sort_key],
                            ReturnConsumedCapacity= "TOTAL")['Items']

    for item in response:
        user_id = item['user_id']['S']
        sf_id = item['sf_id']['S']

        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(forms_table)
        
        #update in dynamodb
        table.update_item(
            Key={'sf_id':sf_id,
                'user_id':user_id
                },
            UpdateExpression='SET #s = :vall',
            ExpressionAttributeNames={"#s":"paid"},
            ExpressionAttributeValues={
                ':vall': True
                 }
            )

    return None
 ```
  This code is written to edit the Cognito_users table's column *paid*, and update all rows to **True** . The code can be used as a template for any table though by subsituting:
       -   all things labeled *sf_id* for whatever the table's partition key
       -   all *user_id* for the table's sort key
       -   "paid" for the name of the column you would like to add/modify
       -   "True" in the ExpressionAttributeValues to whatever value you would like this new column set to
The code's function gets all rows of the given table and itterates through them adding the new column to each row. You can add in additional logic if you would only like to update certain rows. 

In order to run this code, first, create a lambda function and copy and paste this code. Add a Layer with this ARN [arn:aws:lambda:us-east-2:770693421928:layer:Klayers-python38-requests:11]. Also add an Execution Role that includes this policy, "AmazonDynamoDBFullAccess". Edit the Lambda's basic settings to a Timeout long enough to run through all rows in the table and update ( 1 min 30 sec did ~250 rows). Then using the standard default event, test the Lambda. This will run your code and change the dynamoDB table. 
    

If you have any questions or something is on fire please contact one of the
following people in this order:

1. Nate
    - [502-292-8257](tel:+5022928257)
    - [nate@untitledfirm.com](mailto:nate@untitledfirm.com)
2. Cairo
    - [571-432-6194](tel:+5714326194)
    - [cairo@untitledfirm.com](mailto:cairo@untitledfirm.com)
3. Noah
    - [270-999-3818](tel:+2709993818)
    - [noah@untitledfirm.com](mailto:noah@untitledfirm.com)
