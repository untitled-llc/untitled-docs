---
id: overview
title: Overview
sidebar_label: Overview
slug: /esquire/zips_observations/overview
---

## Table of Contents 
* [Brief Explanation](#brief-explanation)
* [Singer IO - Tap OnSpot](#singer-io-tap-onspot)
* [AWS Architecture](#aws-architecture)


## Brief Explanation

This process is used to collect the foot traffic data that is presented on the front end dashboard to Esquire's clientele. For example, one of Esquire's clientele's is HOM Furniture. This is a furniture company that has around 20 different stores in the Minnesota Wisconsin area. The Esquire dashboard allows someone from HOM to look into each unique store they own and see how many people visited that particular store, how many people visited their competitor stores in the area, and how many people visited both their store and competitor Bob's Furniture Store (for example). This data allows furniture companies to make better informed marketing and sales decisions and better understand who their strongest competitors are. 

The architecture for this process is complicated, but can broken down into two main parts: (1) A Singer IO API tap to OnSpot  (2) AWS architecture that "hosts" this process on their cloud infrustructure. This page is an overview of both of these processes and all further detail can be found on the following pages LINK OTHER PAGES HERE. 


## Singer IO - Tap OnSpot 

Singer.io is an open-source, JSON-based data shifting, ETL framework. It is used to move data between an API source and a chosen destination. In reference to this Esquire project, the OnSpot Hyper Targeted Marketing API is the source and the destination is an AWS S3 bucket. It was created to gather information from 3 different OnSpot API endpoints: devices, zipcodes, and observations. Currently, Esquire uses the tap-onspot only for the zipcode and observation endpoint. The zipcode endpoint (POST */geoframe/demographics/aggregate/zipcodes*) is used to send location information and a date range, and returns the household zipcode for the devices found at the given location. It will return a json response like what is shown below, where the response is for one location and given date range, and the count of each zipcode is associated with a device tracked at that lcoation on the entered date:

''' 
{
	"name": "EF~00380", 
	"totalMatched": 4, 
	"demographics":
		{"zipcode": 
			{"78728": 1, 
			"78664": 3, 
			"78724": 1, 
			"78732": 1}
		}, 
	"cbinfo": 
		{"success": true, 
		"message": "SUCCESS", 
		"id": "08d21d07-87ac-40e1-bdd6-dca57dc7b0fe"}
}
'''
The observations endpoint (POST */geoframe/all/observations*) is used to send location information and a date range, and returns the "observations" within that location. The observations being the devices tracked in that location and the time they were tracked. The device will be a hashed indetification. The response looks like the example below:

'''
{
	"name": "EF~01573",
	 "observations": 
	 	[
	 		{"did": "GY6S55EHOB2DBE6SHDI3NFBIQHSG5EFXEH72CEQ5AU4C7ONPOQX5UPXS3FFAVOJL4LLVT2FKN5JZ6===",
	 		 "timestamp": 1599358742000
	 		}
	 	],
	  "cbinfo": 
	  	{"success": true, 
	  	"message": "SUCCESS", 
	  	"id": "08d30a10-d884-43a2-ac62-13a6ae070f38"}
}
'''

The input for both of these OnSpot API endpoints is the same, including the lattitude and longitude corrdinates of a polygon location and a start and end date range. The input body looks like the example below: 

'''
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [
              [
                -123.46478462219238,
                39.07166187346857
              ],
              [
                -123.4659218788147,
                39.06921298141872
              ],
              [
                -123.46278905868529,
                39.0687964947246
              ],
              [
                -123.4616732597351,
                39.07079560844253
              ],
              [
                -123.46478462219238,
                39.07166187346857
              ]
            ]
          ]
        ]
      },
      "properties": {
        "name": "EF~01573",
        "start": "2020-05-08T00:00:00",
        "end": "2020-06-19T23:59:59",
        "callback": "https://yourapi.com/callback"
      }
    }
  ]
}
'''

A further explanation of exactly how the singer.io tap-onspot works is described HERE, but for the sake of this brief overview, the input and output of the API will suffice.

## AWS Architecture

The AWS cloud infrastructure is used to deploy and orchestrate the tap-onspot. The base of this architecture is a simple file of python code used to implement the singer.io tap-onspot and send all responses to an S3 folder. This code is wrapped into a Docker image that is saved on the [AWS ECR (Elastic Container Registry)](https://us-east-2.console.aws.amazon.com/ecr/repositories/private/646976236542/esquire/onspot?region=us-east-2). 

The AWS Batch then uses the image saved in ECR and a compute environment from [AWS EC2 (Elastic Compute Cloud)](https://us-east-2.console.aws.amazon.com/batch/v2/home?region=us-east-2#compute-environments/detail/arn:aws:batch:us-east-2:646976236542:compute-environment/onspot-tap-2) to run the code locally inside the EC2 cloud environment. An [AWS Batch "Job Definition"](https://us-east-2.console.aws.amazon.com/batch/v2/home?region=us-east-2#job-definition) is created to connect AWS Batch to the desired Docker image. There is a separate job definition for both endpoints. An [AWS Batch "Job Queue"](https://us-east-2.console.aws.amazon.com/batch/v2/home?region=us-east-2#queues) is created to define the priority of this job in comparision to other jobs scheduled on the same EC2 compute environment.

The schedule and triggering of this process is set within the AWS Cloudwatch. A [Cloudwatch Rule](https://us-east-2.console.aws.amazon.com/cloudwatch/home?region=us-east-2#rules:) is created to define the desired schedule for each endpoint. The rule is connected to the AWS Batch Job Defintion and Job Queue. Once creating this rule the process will be automated. The monitoring log of the API calls will be saved under the CloudWatch Logs within the log group [*/aws/batch/job*](https://us-east-2.console.aws.amazon.com/cloudwatch/home?region=us-east-2#logsV2:log-groups/log-group/$252Faws$252Fbatch$252Fjob).

The OnSpot API is asynchronous so the process of uploading the response (ie "target") from the request (ie "tap") is a bit more complicated. The request is sent from the running of this repository's code and is saved to S3 [(*/esquire-api-taps/tap-onspot/output/requests/< endpoint >/*)](https://s3.console.aws.amazon.com/s3/buckets/esquire-api-taps?region=us-east-2&prefix=tap-onspot/output/requests/&showversions=false) through the tap-onspot Singer IO code. The response is then saved in two parts.

The first response, which returns a response_id and a HTTP response code of success or not, is saved immediately to S3 using the singer.io tap-onspot code [(*/esquire-api-taps/tap-onspot/output/target/< endpoint >/*)](https://s3.console.aws.amazon.com/s3/buckets/esquire-api-taps?region=us-east-2&prefix=tap-onspot/output/target/&showversions=false). The second response, which contains the requested information/data as shown above, will be returned, after an unknown amount of time, to the entered callbackURL given in the initial API call payload, in this case, we use an API created on AWS API Gateway [https://qfisfzm7cf.execute-api.us-east-2.amazonaws.com/default/default](https://us-east-2.console.aws.amazon.com/apigateway/home?region=us-east-2#/apis/qfisfzm7cf/stages/default/resources/~1default/methods/POST).

This AWS Gateway API then takes the second response and sends the response messages from OnSpot API to AWS SQS [**tap_onspot_messages**](https://us-east-2.console.aws.amazon.com/sqs/v2/home?region=us-east-2#/queues/https%3A%2F%2Fsqs.us-east-2.amazonaws.com%2F646976236542%2Ftap_onspot_messages) to hold. SQS allows for the system's code to not be overwhelmed by the speed or volume at which the responses are coming in. Each message entered into SQS triggers a Lambda function, [**tap-onspot_response_s3_upload_sqs**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/tap-onspot_response_s3_upload_sqs?tab=configuration). The Lambda function's job is to enter the response into an S3 folder for responses [(*/esquire-api-taps/tap-onspot/output/responses/< endpoint >/*)](https://s3.console.aws.amazon.com/s3/buckets/esquire-api-taps?region=us-east-2&prefix=tap-onspot/output/responses/&showversions=false), and also combines the response with its corresponding request into a combined S3 folder [(*/esquire-api-taps/tap-onspot/output/combined/< endpoint >/*)](https://s3.console.aws.amazon.com/s3/buckets/esquire-api-taps?region=us-east-2&prefix=tap-onspot/output/combined/&showversions=false). The request and second response are combined using the OnSpot defined unique identifier. They must be combined so that the name of the combined file can indicate what the endpoint is, what the location is and the date it is in response to (ie. ***stream\_name**\_**location\_id**\_**query_date**.csv*) (The location_id is an Esquire created ID that is used throughout all of their internal architecture to define the unique store.) 

A Glue crawler, [**onspot_crawler**](https://us-east-2.console.aws.amazon.com/glue/home?region=us-east-2#crawler:name=onspot_crawler) and the AWS Glue jobs [**onspt_observations** and **onspot_zipcodes**](https://us-east-2.console.aws.amazon.com/glue/home?region=us-east-2#etl:tab=jobs) then take the OnSpot API data from the S3 combined folder to the Redshift **onspot-cluster**. Redshift data is used in Sisense to present the final product on the Esquire dashboard.
