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
:::

```
Examples: 
  - ad_appliance_center_0015a00002ri7rjqa1_facebook
  - afw_0015a00002bzql4qap_facebook 
  - bostonappliance__0015a00002nqga6qap_facebook
```
3. Authorize the connection
4. Select the account you want to pull data from
5. Save the connection
6. Select the ads and ads_insights tables to replicate and select all columns from both tables. 

# Automation Process 

## Lambda Functions

### [**combine_esquire_datalake_folders**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/combine_esquire_datalake_folders?tab=configuration)

**Trigger** - S3 ObjectCreatedByPut & S3 ObjectCreatedByCompleteMultipartUpload in the path: *esquire-datalake/*

**Layers** - NA

**Function** - 
