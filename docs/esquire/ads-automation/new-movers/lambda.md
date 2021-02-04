---
id: lambda
title: Lambda Functions
sidebar_label: Lambda Functions
slug: /esquire/ads_automation/NM/lambda
---

## Functions Table of Contents
* [trigger-mover-data-unload](#trigger-mover-data-unload)
* [matching_avrick_zips](#matching_avrick_zips)
* [onspot-address-devices-request](#onspot-address-devices-request)
* [onspot-s3-output-copy](#onspot-s3-output-copy)
* [xandr-ads-automation](#xandr-ads-automation)
* [fb-ads-automation-lambda](#fb-ads-automation-lambda)




## [trigger-mover-data-unload](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/trigger-mover-data-unload?tab=configuration) 
**Trigger** -  Cloudwatch Event for the aws.glue job **esquire-movers** with the state "SUCCEEDED"\
**Layers** -   psycopg2-py38 ARN\
**Function** - This function connects with **dev** database on the esquire-myraid-prod-cluster in Redshift and "CALL"s the procedure public.sp_movers_files_unload(). This is the procedure, described in the overview, uses the Avrick new mover's addresses to connnect with our Redshift table and find which addresses connect with which stores. The Redshift tables are made using Esquire's Salesforce custom objects through a connection by Stitch. \

## [matching_avrick_zips](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/matching_avrick_zips) 
**Trigger** - S3 folder path *esquire-redshift-unload-ads-automation/new-movers/* with the Event Type "ObjectCreated"\
**Layers** - Klayers-python38-pandas ARN  &  Klayers-python38-numpy ARN\
**Function** -  
1) This function recieves the event of a new file in the */new-movers/* folder and downloads this file locally. The file is read in as a Pandas dataframe and formatted to ensure there are no empty columns and no additional columns added. \
2) It then finds the week_number of today's date \
NOTE - there is a "band-aid" logic line due to the complexity of solving for the week_number. It should not ever reach this line if run on the usual schedule\
3) It then writes this file to S3 *mover-match-and-parse/full-matched-files/*\
4) The dataframe is then grouped based upon the child_id__c. (Thr child_id__c is the Salesforce ID for each of the unique stores)\
5) The function itterates through each child_id__c section and saves to file to S3 *mover-match-and-parse/**store_name**_**sf_id**/*\
6) It then splits the dataframe down to soley the address related columns and uploads to S3 *esquire-onspot-va/input/new*. This folder is used in the OnSpot API call to be used as the input addresses. The file is saved using a long name that is used through this process for uniqueness and clarity. The file name is : **store_name**_**sf_id**_**todaysdate**_**W#**_NM_act_**fb_id**_**xandr_id**.csv. All of the variables in this file name are required to stay attached to the specific file. \



## [onspot-address-devices-request](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/onspot-address-devices-request)
**Trigger** - SQS **onspot_address_devices** can send up to 10 messages in a batch\
**Layers** - NA\
**Function** - \
1) Itterates through each record in the batch and finds the associated filename\
2) It then uses this filename in the OnSpot API call to point OnSpot to the S3 location of that "input file" and also to determine the name and destination of OnSpot's response.\
3) It makes the call to OnSpot Api entering a file full of addresses, expecting a file, with the same file_name to be returned from OnSpot to S3 *esquire-onspot-va/output/new* asynrchronously \
4) Finally, it uploads the original OnSpot API response (a message stating OnSpot recieved the message w/ the http status code) to S3 *esquire-api-taps/tap-onspot/output/requests/*\


## [onspot-s3-output-copy](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/onspot-s3-output-copy)
**Trigger** - S3 folder path *esquire-onspot-va/output/new* with the Event Type "ObjectCreated"\
**Layers** - NA\
**Function** - \
1) This function first determines whether it is a "debug" file or a regular "addressdevices file" and based on this defines the s3_file_regex and the base_filename\
2) If it is an "addressdevices" file, it then copies the file to S3 *segment-upload-bucket/NM/* to trigger the next step in the NM process. \
3) It also copies the original input file in S3 *esquire-onspot-va/input/new/* into the S3 *esquire-onspot-va/input/archived/* and deletes from */input/new/*\
4) Finally, no matter what the input file is, it copies the source file from S3 *esquire-onspot-va/output/new/* to S3 *esquire-onspot-va/output/archived/* and then deletes the source \

## [xandr-ads-automation](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/xandr-ads-automation)
**Trigger** - SQS **xandr_audience** can send only one mesasage in a batch \
**Layers** - NA\
**Function** -   \
1) Sends SQS message to the **facebook_audience** SQS with the exact same event body\
2) Splits the filename up to define each of the variables (store_name, sf_id, segment_date, audience_type, fb_id, xandr_id)\
3) If the xandr_id is null it ends the function because the current event file doesnot have a Xandr Ad Account\
4) It then ensures the length of the store_name is less than or equal to 28 characters\
	- if its not.. it will remove the word "furniture" and then the trailing characters to have under 29 characters\
5) The segment_name is defined as the **store_name**_**sf_id**_**audience_type**\
6) It then uses the Xandr API to find the respective segment_id.\
	- If a segment_id doesnot exist it will create a new segment\
7) The function makes an API call to OnSpot, entering the S3 sourcePath *esquire-onspot-va/output/archive/* , the segment_name, the segment_id, the Esquire auth information, and a callback_url. OnSpot will use the sourcePath to find the "input" of hashed devices that Esquire would like added to this specific segment. It will update the segment_id given.\
8) Finally it deletes the orignal event file from S3 *segment-upload-bucket/NM/*\

## [fb-ads-automation-lambda](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/fb-ads-automation-lambda)
**Trigger** - SQS **facebook_audience** can send only one mesasage in a batch \
**Layers** - NA\
**Function** -  \
1) Splits the filename up to define each of the variables (store_name, sf_id, segment_date, audience_type, fb_id, xandr_id)\
2) If the fb_id is null it ends the function because the current event file doesnot have a Xandr Ad Account\
3) It then ensures the length of the store_name is less than or equal to 28 characters\
	- if its not.. it will remove the word "furniture" and then the trailing characters to have under 29 characters\
4) The custom_audience_name is defined as the **store_name**_**sf_id**_**segment_date**_**audience_type** \
5) The function makes an API call to OnSpot, entering the S3 sourcePath *esquire-onspot-va/output/archive/* , the custom_audience_name, the Esquire auth information, and a callback_url. OnSpot will use the sourcePath to find the "input" of hashed devices that Esquire would like added to this specific custom audience. It will create a new custom audience on Facebook everytime with the entered hashed devices. 


