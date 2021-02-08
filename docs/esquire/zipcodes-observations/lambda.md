---
id: lambda
title: Lambda Functions
sidebar_label: Lambda Functions
slug: /esquire/zips_observations/lambda
---

## Functions Table of Contents
* [tap-onspot_response_s3_upload_sqs](#tap-onspotresponse_s3_upload_sqs)
* [combine_geojson_files](#combine_geojson_files)


## [tap-onspot_response_s3_upload_sqs](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/tap-onspot_response_s3_upload_sqs?tab=configuration) 
**Trigger** -  SQS **tap_onspot_messages** that can send up to 10 messages per batch

**Layers** -   N/A

**Function** - 
1. The function begins by defining the variables **response_id** and **location_id** based on the event's message. It also finds the **response_filename** for the event. This function does make the assumption that only message will come in at a time from OnSpot. 
2. It then defines the **stream_name** (aka "zipcodes" or "observations") based on the event response message.
3. The response is then uploaded to S3[(*/esquire-api-taps/tap-onspot/output/responses/< stream_name >/*)](https://s3.console.aws.amazon.com/s3/buckets/esquire-api-taps?region=us-east-2&prefix=tap-onspot/output/responses/&showversions=false) to two different folders depending on the **stream_name**.
4. The function looks in the S3 request folder for a request filename that matches the **stream_name** and the **response_id** (ie. *esquire-api-taps/tap-onspot/output/request/**stream_name**/**stream_name**\_**resonse_id**.json*). 
    - the function uses S3 waiter to wait until the file reaches the S3 request folder. The waiter will check, if not found, wait 10 seconds and try again. It will check up to 20 times and if the file is never found, it will throw an error, "S3 REQUEST NOT FOUND : {}, Bucket: {}, Filename: {}, Location: {}, Response ID: {}"
5. It will then combine the request file with the response message that the function recieved. If it is a zipcode file, it will pivot the zipcodes to an abstracted list-array of zipcodes. It will name this new file ***stream_name**\_**location_id**\_**query_date**.json* and place the file in S3 [(*/esquire-api-taps/tap-onspot/output/combined/< endpoint >/*)](https://s3.console.aws.amazon.com/s3/buckets/esquire-api-taps?region=us-east-2&prefix=tap-onspot/output/combined/&showversions=false). 


## [combine_geojson_files](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/combine_geojson_files?tab=configuration)

**Trigger** -  CloudWatch Rule *schedule_geojson_drop* sets a cron schedule to be run every Tuesday, Thursday and Sunday at 3 AM GMT (11PM EST)

**Layers** -   N/A

**Function** - 
1. Lists all files in the *esquireo-api-taps/tap-onspot/input/active_locations/* folder, copies them to the *archived/* folder and deletes from the *active_location/* folder
2. Itterates through the files in the SalesForce folder, *esquire-datalake/esquire_salesforce/Competitor_Locations__c* and finds the file that was last added to this folder
3. It then locally downloads this file. This file will be a long list of all Competitor_Locations__c currently on SalesForce.  It will filter out all un-active and deleted locations.
4. It then splits the locations into a unqiue file for each batch of 50 locations. 
5. Once a file reaches 50 unique locations, it is uploaded to S3 *esquire-api-taps/tap-onspot/input/active_locations/* with a file name *esquire_locations_< count >.json*. The count is just used so that each file in the *active_locations/* folder has a unique name. 