---
id: overview
title: Overview
sidebar_label: Overview
slug: /esquire/avrick_movers/overview
---

[Avrick](https://avrickdirect.com/) is a compnay used by Esquire that provides datasets related to: 
  - **Pre Movers** - A list of movers that currently have their home listed for sale and will be moving in the near future.
  - **Escrow** - A list of movers that are under contract to sell and are in escrow. Most of these sales will close within 30 days. 
  - **New Movers** - A list of movers that have self reported information regarding their upcoming move.  

Each week files from Avrick are dropped into three folders (AVRICK-combined-newmovers-weekly, AVRICK-pendingfile-escrow-movers and AVRICK-premovers) in the esquire-movers bucket via an [SFTP](https://us-east-2.console.aws.amazon.com/transfer/home?region=us-east-2#/servers/s-2e3d12265245491ea). Once files are dropped into their respective folders, lambda functions are triggered that maintain the files. 

![Avrick Movers](https://user-images.githubusercontent.com/51334006/106664754-81e75d00-6573-11eb-9f49-707f634f1a93.png)
