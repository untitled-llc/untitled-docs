---
id: overview
title: Overview
sidebar_label: Overview
slug: /esquire/ads_automation/NM/overview
---



## Table of Contents 
* [Brief Explanation](#brief-explanation)
* [Steps](#steps)
* [Supplemental Information](#supplemental-information)


## Brief Explanation

This process is used to automate the transformation of Avrick New Mover's data to a custom segment in Xandr or a custom audience in Facebook. This allows Esquire to cater their advertisements, on both Facebook and Xander, to a particular aundience of new movers. New movers are sought after customers, particularly for furniture and mattress companies. This is because people that are moving are much more likely to need a new couch or bed and be willing to spend a lot of money at once. The company Esquire purchases the new data from, Avrick, is a 35 year old database industry for new mover data across the US. The Avrick New Mover's data is a collection of self-reported changes of address by the mover themselves. The Avrick company delivers a csv file through FTP containing all of the mover's new addresses from across the United States, for that week. The csv file looks like the example below. 

![](https://user-images.githubusercontent.com/71343561/106802053-727a1980-6630-11eb-89bd-caf6b54d1320.png)

## Steps

![Esquire New Mover](https://user-images.githubusercontent.com/71343561/106802906-938f3a00-6631-11eb-9e18-d00975346a44.png)



1. The csv file of new mover adresses is delivered to S3 [*esquire-movers/AVRICK-combined-newmovers-weekly/*](https://s3.console.aws.amazon.com/s3/buckets/esquire-movers?region=us-east-2&prefix=AVRICK-combined-newmovers-weekly/&showversions=false)

2. The S3 bucket triggers the Lambda function [**delete_movers**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/delete_movers?tab=configuration). This function holds much of the Avrick S3 re-formatting and moving around/combining of the files. In relation to the New Mover process, this function moves the csv file from Avrick into a new S3 folder [*esquire-movers/movers-3-month-segment-partitioned/*](https://s3.console.aws.amazon.com/s3/buckets/esquire-movers?region=us-east-2&prefix=movers-3-month-segment-partitioned/&showversions=false). It also triggers the AWS Glue job, [**esquire-movers**](https://us-east-2.console.aws.amazon.com/glue/home?region=us-east-2#etl:tab=jobs).

3. The Glue job copies the Avrick new mover csv file from the new S3 folder into Redshift's [**esquire-myraid-prod-cluster**.](https://us-east-2.console.aws.amazon.com/redshiftv2/home?region=us-east-2#cluster-details?cluster=esquire-myriad-prod-cluster)

4. A [Cloudwatch event](https://us-east-2.console.aws.amazon.com/cloudwatch/home?region=us-east-2#logsV2:log-groups/log-group/$252Faws-glue$252Fjobs$252Foutput) of the success of the **esquire-movers** Glue job will trigger the Lambda function [**trigger-mover-data-unload**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/trigger-mover-data-unload?tab=configuration). This function will trigger the Redshift procedure [**movers_unload_file.sql**](https://github.com/Esquire-Media/data-deduplication/blob/master/movers_unload_file.sql) 

5. This sql procedure will join the zipcodes from the csv file with the avrick_zip_list__c table that associates zipcodes with child_id__c. The child_id__c is then joined with the acount__c to find the parent Salesforce Account. This account is then joined with the correlated Facebook Ad ID, Xandr Ad ID, ElToro Ad ID and Google Ads ID. All of the joined data is added to the csv to return a file with the columns (*combined_address, city, st, zip, zip4, store_name__c, child_id__c, facebook, xandr, el toro, google ads*) to S3 [*redshift-unload-ads-automation/new-movers/*](https://s3.console.aws.amazon.com/s3/buckets/redshift-unload-ads-automation?region=us-east-2&prefix=new-movers/&showversions=false).
   
 NOTE - the avrick_zip_list__c are the "top" 20 zip codes for sales for that particular store. 

6. This S3 folder will trigger the Lambda function [**matching-avrick-zips**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/matching_avrick_zips?tab=configuration) This function will format and rename the file for the OnSpot API call's input later on in this process. It drops the new formatted, split files into S3 [*esquire-onspot-va/input/new*](https://s3.console.aws.amazon.com/s3/buckets/esquire-onspot-va?region=us-east-1&prefix=input/new/&showversions=false).

7. Each dropped file in the above steps S3 folder leads to the triggering of the SQS [**onspot-address-devices**](https://console.aws.amazon.com/sqs/v2/home?region=us-east-1#/queues/https%3A%2F%2Fsqs.us-east-1.amazonaws.com%2F646976236542%2Fonspot_address_devices). 

8. This SQS than triggers the Lambda function [**onspot-address-devices-request**](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/onspot-address-devices-request) This Lambda makes the initial OnSpot API call to get the corresponding hashed device IDs for each address file given as the input of the API call. It informs OnSpot to send all responses including the hashed device IDs to S3 [*esquire-onspot-va/output/new/*](https://s3.console.aws.amazon.com/s3/buckets/esquire-onspot-va?region=us-east-1&prefix=output/new/&showversions=false)

9. This S3 folder triggers the lambda [**onspot-s3-output-copy**](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/onspot-s3-output-copy?tab=configuration) This function will move the hashed device IDs to S3 [*segment-upload-bucket/NM/*](https://s3.console.aws.amazon.com/s3/buckets/segment-upload-bucket?region=us-east-2&prefix=NM/&showversions=false) to be used as a trigger for the next step. It also moves a few other S3 files for organizational purposes.

10. The S3 folder triggers the SQS [**xander_audience**](https://us-east-2.console.aws.amazon.com/sqs/v2/home?region=us-east-2#/queues/https%3A%2F%2Fsqs.us-east-2.amazonaws.com%2F646976236542%2Fxandr_audience), that in turns triggers the Lambda [**xander-ads-automation**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/xandr-ads-automation). This lambda function makes the call to OnSpot API to post the hashed device IDs as a Xandr custom segment under the corresponding store's Xandr Ad account. It also triggers the SQS [**facebook_audience**](https://us-east-2.console.aws.amazon.com/sqs/v2/home?region=us-east-2#/queues/https%3A%2F%2Fsqs.us-east-2.amazonaws.com%2F646976236542%2Ffacebook_audience). 

11. This SQS will trigger the Lambda function [**fb-ads-automation-lambda**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/fb-ads-automation-lambda). This function makes the call to OnSpot API to post the hashed device IDs as a Facebook custom audience under the corresponding store's Facebook Ad account. 


## Supplemental Information

### Split of Some Lambda Functions and S3 Buckets in the AWS Virginia Region 
The Lambda functions **onspot-address-devices-request** and **onspot-s3-output-copy**, the SQS **onspot\_address\_devices**, and the S3 bucket **esquire-onspot-va** are all under the AWS region US East N. Virginia (us-east-1) while the rest of Esquire's AWS is situated in US East Ohio (us-east-2). These 4 pieces are in a different AWS region because the OnSpot API can only use input body data that is inside an S3 in the same region as them, us-east-1. [The transfer of data using SQS is free between the same region (and is not between different regions once over 1GB of data).](https://aws.amazon.com/sqs/faqs/#:~:text=You%20can%20transfer%20data%20between,information%2C%20see%20Amazon%20SQS%20Pricing). This is why the SQS and Lambda functions are also in the us-east-1 region. 

There is a way to transfer data between different regions using SQS, but the IAM policy must be customized and the ARN cannot include the region. Look to this StackOverflow for more information (https://stackoverflow.com/questions/32527976/allow-aws-sqs-queue-access-across-regions/32530222)

### Reason There are Two Separate SQS queues for Xandr and Facebook 
The Xandr SQS, **xandr_audience** is original set off by an S3 bucket drop into *esquire-segment-upload-bucket/NM/*. You cannot just have one **ad_audience** SQS that sends the message from S3 to both Lambda's because SQS can only sucessfully deliver once. It can not have one source message and two delivered messages of that source. You also cannot connect both SQSs, **xandr_audience** and **facebook_audience** to the S3 because S3 doesnot allow an overlap of prefix paths for two SQS's. Or in other words, S3 does not allow two SQS to be set on the same event folder path. 

In theory, you could set up the **xandr_audience** SQS on a different Xandr folder and **facebook_audience** SQS on a differnt Facebook folder and drop each file in both folders, but this would just add more work and repetition to the process. 
