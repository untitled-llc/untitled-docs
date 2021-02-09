---
id: overview
title: Overview
sidebar_label: Overview
slug: /esquire/avrick_movers/overview
---

[Avrick](https://avrickdirect.com/) is a compnay used by Esquire that provides datasets related to: 
  - **Pre Movers** - A list of movers that currently have their home listed for sale and will be moving in the near future.
  - **Escrow Movers** - A list of movers that are under contract to sell and are in escrow. Most of these sales will close within 30 days. 
  - **New Movers** - A list of movers that have self reported information regarding their upcoming move.  

The Pre Movers, Escrow movers and New Movers all contain the following attributes: *add1, add2, city, st, zip, zip4, dt*, but the New Movers file also contains an additional attribute *keycode2* which contains the date. 

## Steps 
![Avrick Movers](https://user-images.githubusercontent.com/51334006/106815848-76af3280-6642-11eb-9b03-9149914fc234.png)

1. Every Monday files from Avrick are dropped into three folders in the [**esquire-movers**](https://s3.console.aws.amazon.com/s3/buckets/esquire-movers?region=us-east-2&tab=objects) bucket via an [SFTP](https://us-east-2.console.aws.amazon.com/transfer/home?region=us-east-2#/servers/s-2e3d12265245491ea). 
    - AVRICK-premovers
    - AVRICK-pendingfile-escrow-movers
    - AVRICK-combined-newmovers-weekly
2. When files are dropped into their respecive folders, lambda functions are triggered that move old files into an archive folder and in the case of New Movers, also combines the most recent 3 months of New Mover data. The following lambda functions pertain to the folders mentioned above in the same order. 
    - [**delete_pre_movers**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/delete_pre_movers?tab=configuration)
    - [**delete_escrow**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/delete_escrow?tab=configuration)
    - [**delete_movers**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/delete_movers?tab=configuration) & [**delete_combined_movers**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/delete_combined_movers?tab=configuration)
3. The **delete_movers** lambda function triggers a Glue job, [**esquire-movers**](https://us-east-2.console.aws.amazon.com/glue/home?region=us-east-2#editJob:isNewlyCreated=false;jobName=esquire-movers) that imports the data to the [**esquire-myraid-prod-cluster**](https://us-east-2.console.aws.amazon.com/redshiftv2/home?region=us-east-2#cluster-details?cluster=esquire-myriad-prod-cluster)
4. The [**myriad-movers-delete-and-unload**](https://us-east-2.console.aws.amazon.com/cloudwatch/home?region=us-east-2#rules:name=myriad-movers-delete-and-unload) event based Cloudwatch Rule is triggered on the success of the **esquire-movers** Glue job. 
5. The **myriad-movers-delete-and-unload** triggers the [**delete_esquire_myriad_prod_movers**](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions?f0=true&n0=false&op=and&v0=delete) lambda function

  
