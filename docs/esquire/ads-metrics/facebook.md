---
id: facebook
title: Facebook Ads
sidebar_label: Facebook Ads
slug: /esquire/ads_metrics/facebook
---

# Setting up a Facebook Connection in Stitch
1. Add a Facebook integration 
2. Name the integration with the following format (ad account name)\_(salesforce id)\_**facebook** <br />
:::note
Stitch connection naming conventions max out at 50 characters. It is CRUTIAL that the connection ends with **\_facebook**, otherwise Facebook data will not be added to Redshift downstream. Additionally the *ad account name* portion of the naming convention can have as many underscores as wanted.
::: <br />
Examples: <br />
   - ad_appliance_center_0015a00002ri7rjqa1_facebook
   - afw_0015a00002bzql4qap_facebook
   - bostonappliance__0015a00002nqga6qap_facebook

3. Authorize the connection
4. Select the account you want to pull data from
5. Save the connection
6. Select the ads table to replicate and select all columns 
7. Select the ads_insights table to replicate and select the *account_id, account_name, ad_id, ad_name, adset_id, adset_name, campaign_id, campaign_name, clicks, cpm, ctr, date_start, impressions* and *spend* columns

# Automation Process 

## Lambda Functions

### [**combine_esquire_datalake_folders**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/combine_esquire_datalake_folders?tab=configuration)

Since this function is used for other parts in the ads metric automation, the descriptions below only explains the parts that pertain to the Facebook Ads metrics automation. 

**Trigger** - S3 ObjectCreatedByPut & S3 ObjectCreatedByCompleteMultipartUpload in the path: *esquire-datalake/*

**Layers** - NA

**Function** -
  1. An event is received by the function that a new file has dropped into the *esquire-datalake* bucket. 
  2. The name of the file is saved as a variable, *newest_file_name*
  3. The top level folder (ex. *afw_0015a00002bzql4qap_facebook*) is saved as a variable, *top_level_fld*
  4. The function checks to see if 'stitch-challenge' is in *newest_file_name* 
  5. If it's not, the function finds the *integration_name* (facebook) from the *top_level_fld* varaible, and finds *folder* name (ads/ads_insights) and *file_name* (0_1586982460954.jsonl) from the *newest_file_name*
  6. Esquire named their Facebook integration with '\_fbaccount', so if 'fbaccount' is in *newest_file_name* the file is copied to the **esquire-datalake-combined** bucket under the path: **facebook**/*folder*/(*top_level_fld*)_(*file_name*)
  7. Otherwise all files are copied to the **esquire-datalake-combined** bucket under the path: (*integration_name*)/(*folder*)/(*top_level_fld*)_(*file_name*)
  
### [**dedupe_esquire_myriad_prod_cluster**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/dedupe_esquire_myriad_prod_cluster?tab=configuration)

Since this function is used for other parts in the ads metric automation, the below only explains the parts that pertain to the Facebook Ads metrics automation. 

**Trigger** -  [*start_dedupe_esquire_myriad_prod_cluster*](https://us-east-2.console.aws.amazon.com/events/home?region=us-east-2#/eventbus/default/rules/start_dedupe_esquire_myriad_prod_cluster) Cloudwatch Event. 

**Layers** - [arn:aws:lambda:us-east-2:898466741470:layer:psycopg2-py37:1](https://github.com/jetbridge/psycopg2-lambda-layer/blob/master/README.md)

**Function** -
  1. An event is received by the function that either the [**facebook_ads**](https://us-east-2.console.aws.amazon.com/glue/home?region=us-east-2#editJob:isNewlyCreated=false;jobName=facebook_ads) or [**facebook_insights**](https://us-east-2.console.aws.amazon.com/glue/home?region=us-east-2#editJob:isNewlyCreated=false;jobName=facebook_insights) Glue job has succeeded. 
  2. Connect to the **esquire-myriad-prod-cluster** in Redshift
  3. Run [ads deduplication procedure](https://github.com/Esquire-Media/data-deduplication/blob/master/Facebook/ads_table.sql) or the [insights deduplication procedure](https://github.com/Esquire-Media/data-deduplication/blob/master/Facebook/insights_table.sql)
  4. Close the connection to the cluster
  
## S3 Buckets 
This documentation is for a clearer description of what files/information can be found within the **esquire-datalake** and **esquire-datalake-combined** buckets
  
  1. [*esquire-datalake/*](https://s3.console.aws.amazon.com/s3/buckets/esquire-datalake?region=us-east-2&tab=objects) <br />
  This bucket serves as a dumping ground for all files relating to Facebook ads and Facebook ads_insights along with other miscellaneous files that don't necessarily pertain to Esquire's clients ads, like Google Ads, Google Sheets and Salesforce. For all of the Facebook integrations, when Stitch first drops a file, the name given by Esquire for the Stitch integration is used as the folder name, and the files relating to that integration will fall under those folders thereafter. So each client that Esquire has advertising on Facebook will have their own folder in the **esquire-datalake** bucket that follows the naming convention seen [here](#setting-up-a-facebook-connection-in-stitch). 
     1. *ads* files - contains basic inforamtion about the ad including: *account_id, adset_id,  bid_amount, bid_info_impressions, bid_info_reach, bid_type, campaign_id, created_time, creative_id, effective_status* (whether the ad/adset/campaign is paused/active), id* (ad id)*, name* (the name of the ad)*, soure_ad_id, status* (whether the ad is paused/active) and *updated_time*. There are also columns added by Stitch that all start with *\_sdc* which help identify when the records were extracted. 
     2. *ads_insights* files - contains basic information about how the ads found in the *ads* files are performing. The columns in these files include: *account_id, account_name, ad_id, ad_name, adset_id, adset_name, campaign_id, campaign_name, clicks, cpm, ctr, date_start, impressions* and *spend*. As with the *ads* files, there are also columns added by Stitch that all start with *\_sdc* which help identify when the records were extracted. 
  
 2. [*esquire-datalake-combined/*](https://s3.console.aws.amazon.com/s3/buckets/esquire-datalake-combined?region=us-east-2&tab=objects) <br />
 This bucket contains the same information (in regards to Facebook files ONLY) to the **esquire-datalake** bucket, but instead has all files relating to Facebook under a single folder, *facebook*. This folder additionally contains two other folders that further separtes the files from **esquire-datalake** into *ads* and *ads_insights*. This folder structure is needed so that Glue is able to crawl all files under the *facebook* folder. Otherwise creating a crawler on all client files from **esquire-datalake** will create multiple Glue tables, which means multiple Glue jobs would need to be created (one for *ads* and one for *ads_insights* for each client). Using this folder structure instead allows us to only have two different Glue jobs, [**facebook_ads**](https://us-east-2.console.aws.amazon.com/glue/home?region=us-east-2#editJob:isNewlyCreated=false;jobName=facebook_ads) and [**facebook_insights**](https://us-east-2.console.aws.amazon.com/glue/home?region=us-east-2#editJob:isNewlyCreated=false;jobName=facebook_insights). 
  
  
  
