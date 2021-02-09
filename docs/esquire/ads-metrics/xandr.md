---
id: xandr
title: Xandr
sidebar_label: Xandr
slug: /esquire/ads_metrics/xandr
---

# Setting up a Xandr Connection in Funnel.io
1. Add a new Data Source
2. Authorize Facebook and choose the account you want to set up a connection for 
3. Name the connection (Esquire uses the ad account name) 
4. Since all AppNexus connections are under the *xandr-funnel-export*, the dimensions and metrics that need to be selected are alreay done (i.e. no further action is required once the account is authorized)

# Automation Process 

## Lambda Functions

### [**combine_esquire_datalake_folders**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/combine_esquire_datalake_folders?tab=configuration)

Since this function is used for other parts in the ads metric automation, the descriptions below only explains the parts that pertain to the Xandr metrics automation. 

**Trigger** - S3 ObjectCreatedByPut & S3 ObjectCreatedByCompleteMultipartUpload in the path: *esquire-datalake/*

**Layers** - NA

**Function** -
  1. An event is received by the function that a new file has dropped into the *esquire-datalake* bucket. 
  2. The name of the file is saved as a variable, *newest_file_name*
  3. Check to see if *esquire-xandr* is in *newest_file_name*
  4. If it is, the file does not need to be copied to **esquire-datalake-combined**
  5. Return
  
### [**dedupe_esquire_myriad_prod_cluster**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/dedupe_esquire_myriad_prod_cluster?tab=configuration)

Since this function is used for other parts in the ads metric automation, the below only explains the parts that pertain to the Xandr metrics automation. 

**Trigger** -  [*start_dedupe_esquire_myriad_prod_cluster*](https://us-east-2.console.aws.amazon.com/events/home?region=us-east-2#/eventbus/default/rules/start_dedupe_esquire_myriad_prod_cluster) Cloudwatch Event. 

**Layers** - [arn:aws:lambda:us-east-2:898466741470:layer:psycopg2-py37:1](https://github.com/jetbridge/psycopg2-lambda-layer/blob/master/README.md)

**Function** -
  1. An event is received by the function that either the [**xandr_data**](https://us-east-2.console.aws.amazon.com/glue/home?region=us-east-2#editJob:isNewlyCreated=false;jobName=xandr_data) Glue job has succeeded. 
  2. Connect to the **esquire-myriad-prod-cluster** in Redshift
  3. Run [xandr appnexus deduplication procedure](https://github.com/Esquire-Media/data-deduplication/blob/master/Xandr/xandr_appnexus_table.sql) 
  4. Close the connection to the cluster
  
## S3 Buckets 
This documentation is for a clearer description of what files/information can be found within the **esquire-datalake** bucket for files related to *Xandr* data.
  
  1. [*esquire-datalake/*](https://s3.console.aws.amazon.com/s3/buckets/esquire-datalake?region=us-east-2&tab=objects) <br />
  This bucket serves as a dumping ground for all files relating to Xandr along with other miscellaneous files that don't necessarily pertain to Esquire's clients ads, like Google Ads, Google Sheets and Salesforce. For all of the Xandr connections, the data will fall under the [*esquire-xandr/*](https://s3.console.aws.amazon.com/s3/buckets/esquire-datalake?region=us-east-2&prefix=esquire-xandr/&showversions=false) folder in **esquire-datalake**. You will also see the additional folder and files: *Date, Data Source type, Data Source id, Currency, Advertiser ID, Advertiser name, Campaign ID, Campaign name, Creative ID, Creative name, Insertion order ID, Insertion order name, Clicks, Impressions, Media cost, Spend, Line item ID* and *Lime item name*. 
  2. *schema.funnel_data_{startYYYY}_{startMM}.sql* - Contains SQL code to create a table with the columns exported from Funnel.io (This is not used)
  3. *summary.funnel_data_{startYYYY}_{startMM}.json* - Contains metadata about the CSV file dropped from Funnel.io (This is not used)
  4. *test.funnel_data_{startYYYY}_{startMM}.txt* - A test file from Funnel.io (This is not used)
  5. *verificationToken.txt* - The token Funnel.io uses for bucket verification - DO NOT DELETE
  
## Supplemental Information
Xandr data does not need to be copied to the **esquire-datalake-combined** bucket becuase all AppNexus connections in Funnel.io fall under ONE export, unlike Stich where each Facebook integration exports to a different folder. Because the data coming from Funnel.io works this way, there is no issue when creating Glue crawlers like there is for Stitch. If you're reading about Xandr data before Facebook, reference part 2 [here](https://happy-rosalind-dc4d93.netlify.app/docs/esquire/ads_metrics/facebook#s3-buckets) for more information. 
