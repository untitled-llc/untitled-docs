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
  <br /> NOTE: The Glue job is started here because at the time I did not know about S3 waiters, which allows you to 'wait' until a file had been dropped to a specific location. So, placing the job run here allows the file enough time to successfuly copy to the *movers-3-month-segment-partitioned/* folder before running.
  
  6. Determine the number of files in the *archived-data/archive movers-3-month-segment-partitioned/* folder. <br /> 
   <br /> NOTE: Again, this is done because I didn't know about waiters. This will eventually help me determine if the number of files in the archive folder has gone up, meaning that another file had been added in the archive. 
   
 


## [**delete_combined_movers**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/delete_combined_movers?tab=configuration)

**Trigger** - S3 ObjectCreatedByPut & S3 ObjectCreatedByCompleteMultipartUpload in the path: *esquire-movers/movers-3-month-segment-combined/*

**Layers** - NA

**Function** - 
  1. 

## [**delete_esquire_myriad_prod_movers**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions?f0=true&n0=false&op=and&v0=delete)

**Trigger** - Event based Cloudwatch Rule, **myriad-movers-delete-and-unload** that will tigger on the succession of the **esquire-movers** Glue job.

**Layers** - NA

**Function** - 
  1. 
