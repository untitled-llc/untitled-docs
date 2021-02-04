---
id: redshift-glue
title: Redshift & Glue
sidebar_label: Redshift & Glue
slug: /esquire/ads_automation/NM/redshift
---



The following Redshift and AWS Glue jobs are listed in the order they appear with the New Mover Ads Automation. This documentation is for a more indepth explanation of what these jobs do.


1.  [**esquire-movers**](https://us-east-2.console.aws.amazon.com/glue/home?region=us-east-2#etl:tab=jobs) (AWS Glue Job) This Glue job is triggered from within the **delete_movers** Lambda function. 

       1. The Glue job creates a dataframe based upon the AWS Glue database *movers* table called *movers_3-month_segment_partitioned*. This table was orignally created based upon a csv file  of new mover addresses from Avrick. 
       2. It then reformats the date column that was previously called *keycode2* and was in the format yyyyMMdd, to a column called *formatted_date* in the format yyyy-MM-dd. This column is only used by the following redshift SQL procedure to only look at mover data from the latest week. It is reformatted to match PostgresSQL Language max() function. 
       3. It enforces the columns [ *add1, add2, city, st, zip, zip4, dt, keycode2, formatted_date*]
       4. Drops the Null Fields
       5. Writes the dataframe to Redshift cluster *esquire-myriad-prod*, database *dev*, table *movers*. 

2. [**movers_unload_file.sql**](https://github.com/Esquire-Media/data-deduplication/blob/master/movers_unload_file.sql) (Redshift Procedure) This procedure is used to join the Avrick new mover data with Esquire's current client information that comes from Salesforce and is saved on Redshift in tables for each custom object.

       1. Combines the add1 and add2 and capatilizes the first letter of each word in the new *combined_address* column
       2. It also capitalizes the first letter of each word in the city
       3. It then only pulls the *combined_address, city, st, zip, and zip4* from the **movers** table.
       4. This table's *zip* is inner joined with the **Avrick\_Zip\_id\__c** on *zipcode*
       5. The *child\_id|__c* from **Avrick\_zip\_id\__c** is inner joined with the *id* from **child\_id\__c**
       6. The *parent\_account\__c* from **child\_id\__c** is then inner joined with the *account\_c* from **dashboard\_source\__c**
       7. All of these inner joined tables are then left joined on the **dashboard\_source\__c** table to add a *facebook, xander, el toro*, and *google ads* columns
       8. It filters out the *account\__c* if they are not inside the table **movers\_sf\_ids**
       9. Finally it is grouped by *combined_address, zip, zip4, city, st, store\_name\__c, child\_id\__c, facebook, xandr, el toro, google ads* and uploaded to S3 *redshift-unload-ads-automation/new-movers/movers-unload.csv*
