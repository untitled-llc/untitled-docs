---
id: overview
title: Overview
sidebar_label: Overview
slug: /esquire/ads-metrics/overview
---

This process is used to automate ad reporting for all of Esquire's clients, which are then displayed in Sisense for thier clients to review. Esquire predominantly uses [Facebook Ads](https://www.facebook.com/business/ads) and [Xandr](https://www.xandr.com/) as thier advertising platforms, but also have a few clients that utilize [El Toro](https://eltoro.com/).

To get data from these advertising platforms, different tools are utilized for each. 
   1. **Facebook Ads** - Uses the [Stitch Facebook Connection](https://www.stitchdata.com/docs/integrations/saas/facebook-ads) and duplicates the [ads](https://www.stitchdata.com/docs/integrations/saas/facebook-ads#ads) and [ads_insights](https://www.stitchdata.com/docs/integrations/saas/facebook-ads#ads-insights) tables. 
   2. **Xandr** - Uses the AppNexus connection from [Funnel.io](0https://funnel.io/) <br /> 
   NOTE: AT&T bought AppNexus and consolidated it with their Xandr division. Hence why the connection in Funnel is called 'AppNexus'.
   3. **El Toro** - Uses a custom connection with their API
 
 In order to get the data from Stitch and Funnel, Esquire needs to set up their clients in these ETL tools before the following steps for each client will happen.
   
## Steps 
![Esquire Ads](https://user-images.githubusercontent.com/51334006/107279316-e21f4880-6a24-11eb-9ab5-14d429eb5cc4.png)

### Facebook
1. Data is exported from Stich and sent to the [**esquire-datalake**](https://s3.console.aws.amazon.com/s3/buckets/esquire-datalake?region=us-east-2&tab=objects) bucket.
2. The [**combine_esquire_datalake_folders**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/combine_esquire_datalake_folders?tab=configuration) lambda function is triggered.
3. The data is copied to the [**esquire-datalake-combined**](https://s3.console.aws.amazon.com/s3/buckets/esquire-datalake-combined?region=us-east-2&tab=objects) bucket. 
4. The [**facebook_ads**](https://us-east-2.console.aws.amazon.com/glue/home?region=us-east-2#editJob:isNewlyCreated=false;jobName=facebook_ads) and [**facebook_insights**](https://us-east-2.console.aws.amazon.com/glue/home?region=us-east-2#editJob:isNewlyCreated=false;jobName=facebook_insights) Glue jobs are triggerd by the [*facebook-trigger*](https://us-east-2.console.aws.amazon.com/glue/home?region=us-east-2#trigger:name=facebook-trigger) every 12 hours. 
5. The [**dedupe_esquire_myriad_prod_cluster**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/dedupe_esquire_myriad_prod_cluster?tab=configuration) is triggered by the [*start_dedupe_esquire_myriad_prod_cluster*](https://us-east-2.console.aws.amazon.com/cloudwatch/home?region=us-east-2#rules:name=start_dedupe_esquire_myriad_prod_cluster) event based Cloudwatch Rule on the succession of the **facebook_ads** and **facebook_insights** Glue jobs. 
6. Facebook Ads data is imported to the [**esquire-myriad-prod-cluster**](https://us-east-2.console.aws.amazon.com/redshiftv2/home?region=us-east-2#cluster-details?cluster=esquire-myriad-prod-cluster) in Redshift. 

### Xandr 
1. Data is exported from Funnel.io and sent to the [**esquire-datalake**](https://s3.console.aws.amazon.com/s3/buckets/esquire-datalake?region=us-east-2&tab=objects) bucket.
2. The [**combine_esquire_datalake_folders**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/combine_esquire_datalake_folders?tab=configuration) lambda function is triggered.
4. The [**xandr_data**](https://us-east-2.console.aws.amazon.com/glue/home?region=us-east-2#editJob:isNewlyCreated=false;jobName=xandr_data) Glue job is triggerd by the [*xandr-trigger*](https://us-east-2.console.aws.amazon.com/glue/home?region=us-east-2#trigger:name=facebook-trigger) every 12 hours. 
5. The [**dedupe_esquire_myriad_prod_cluster**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/dedupe_esquire_myriad_prod_cluster?tab=configuration) is triggered by the [*start_dedupe_esquire_myriad_prod_cluster*](https://us-east-2.console.aws.amazon.com/cloudwatch/home?region=us-east-2#rules:name=start_dedupe_esquire_myriad_prod_cluster) event based Cloudwatch Rule on the succession of the **xandr_data** Glue job. 
6. Xandr data is imported to the [**esquire-myriad-prod-cluster**](https://us-east-2.console.aws.amazon.com/redshiftv2/home?region=us-east-2#cluster-details?cluster=esquire-myriad-prod-cluster) in Redshift. 

### El Toro
