---
id: lambda
title: Lambda Functions
sidebar_label: Lambda Functions
slug: /esquire/avrick_movers/lambda
---

## Functions Table of Contents
- [**delete_pre_movers**](#delete_pre_movers)
- [**delete_escrow**](#delete_escrow)
- [**delete_movers**](#delete_movers)
- [**delete_combined_movers**](#delete_combined_movers)
- [**delete_esquire_myriad_prod_movers**](#delete_esquire_myriad_prod_movers)





## [**delete_pre_movers**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/delete_pre_movers?tab=configuration)

**Trigger** - S3 ObjectCreatedByPut & S3 ObjectCreatedByCompleteMultipartUpload in the path: *esquire-movers/AVRICK-premovers/*

**Layers** - NA

**Function** - 
  1. A event is reveived by the function that a new file has dropped into the *AVRICK-premovers/* folder. 
  2. Using metadata from the files, determine which of the two files is the oldest. 
  3. The oldest file is copied to the following path: *esquire-movers/archived-data/archive premovers/* 
  4. The oldest file is deleted from the following path: *esquire-movers/AVRICK-premovers/*


## [**delete_escrow**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/delete_escrow?tab=configuration)

**Trigger** - S3 ObjectCreatedByPut & S3 ObjectCreatedByCompleteMultipartUpload in the path: *esquire-movers/AVRICK-pendingfile-escrow-movers/*

**Layers** - NA

**Function** - 
  1. A event is reveived by the function that a new file has dropped into the *AVRICK-pendingfile-escrow-movers/* folder. 
  2. Using metadata from the files, determine which of the two files is the oldest. 
  3. The oldest file is copied to the following path: *esquire-movers/archived-data/archive pending-escrow-movers/* 
  4. The oldest file is deleted from the following path: *esquire-movers/AVRICK-pendingfile-escrow-movers/*


## [**delete_movers**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/delete_movers?tab=configuration)

**Trigger** - S3 ObjectCreatedByPut & S3 ObjectCreatedByCompleteMultipartUpload in the path: *esquire-movers/AVRICK-combined-newmovers-weekly/*

**Layers** - NA

**Function** - 
  1. A event is reveived by the function that a new file has dropped into the *AVRICK-combined-newmovers-weekly/* folder. 
  2. The new file is copied to the following path: *esquire-mvoers/movers-3-month-segment-partitioned/*
  3. The new file is deleted from the following path: *esquire-mvoers/AVRICK-combined-newmovers-weekly/* to ensure that AVRICK sees no files in that folder the next time the SFTP is used.
  4. Using metadata from the files in the *movers-3-month-segment-partitioned/* folder, determine which of the 13 files is the oldest. 
  5. Start the **esquire-movers** Glue job. <br />
  <br /> NOTE: The Glue job is started here because at the time I did not know about S3 waiters, which allows you to 'wait' until a file has been dropped to a specific location. So, placing the job run here allows the file enough time to successfuly copy to the *movers-3-month-segment-partitioned/* folder before running. <br/>
  
  
  6. Determine the number of files in the *archived-data/archive movers-3-month-segment-partitioned/* folder. <br /> 
   <br /> NOTE: Again, this is done because I didn't know about waiters. This will eventually help me determine if the number of files in the archive folder has gone up, meaning that another file had been added in the archive. <br/>
   
   
  7. Determine the number of files in the *movers-3-month-segment-partitioned/* folder
  8. If there are 2 - 12 files in the folder, combine all the available files into one. 
  9. If there are over 12 files in the folder, copy the oldest file from the *movers-3-month-segment-partitioned/* folder that was found in step 3 to the following path: *archived-data/archive movers-3-month-segment-partitioned/*
  10. Delete the the oldest file from the *movers-3-month-segment-partitioned/* folder.
  11. Check the number of objects in the *archived-data/archive movers-3-month-segment-partitioned/* folder again (this relates to step 6). 
  12. If the the numbers in step 6 and step 11 are not equal, combine all the files in *movers-3-month-segment-partitioned/* folder. 
  13. Upload the combined movers file to the following path: *esquire-movers/movers-3-month-segment-combined/*
   
 :::note
 All files that are copied into the archive folders must be named with some sort of date identifer at the end for use by Esquire.
 :::


## [**delete_combined_movers**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/delete_combined_movers?tab=configuration)

**Trigger** - S3 ObjectCreatedByPut & S3 ObjectCreatedByCompleteMultipartUpload in the path: *esquire-movers/movers-3-month-segment-combined/*

**Layers** - NA

**Function** - 
  1. A event is reveived by the function that a new file has dropped into the *movers-3-month-segment-combined/* folder. 
  2. Using metadata from the files, determine which of the two files is the oldest. 
  3. The oldest file is copied to the following path: *esquire-movers/archived-data/archive movers-3-month-segment-combined//* 
  4. The oldest file is deleted from the following path: *esquire-movers/movers-3-month-segment-combined/*


## [**delete_esquire_myriad_prod_movers**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions?f0=true&n0=false&op=and&v0=delete)

**Trigger** - Event based Cloudwatch Rule, **myriad-movers-delete-and-unload** that will tigger on the succession of the **esquire-movers** Glue job.

**Layers** - [arn:aws:lambda:us-east-2:898466741470:layer:psycopg2-py37:1](https://github.com/jetbridge/psycopg2-lambda-layer/blob/master/README.md)

**Function** - 
  1. Connect to the **esquire-myriad-prod-cluster** in Redshift. 
  2. Delete all rows where the *formatted_date* (this is inserted to the table when the [**esquire-movers**](https://us-east-2.console.aws.amazon.com/glue/home?region=us-east-2#editJob:isNewlyCreated=false;jobName=esquire-movers) Glue job runs) is the oldest. 
  3. Close the connect to the cluster. 
