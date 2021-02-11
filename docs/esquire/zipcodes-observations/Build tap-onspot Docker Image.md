
---
id: build-tap-onspot-docker-image
title: Build tap-onspot Docker Image
sidebar_label: Build tap-onspot Docker Image
slug: /esquire/zips_observations/docker-image
---


## Table of Contents 
* [Brief Introduction](#brief-introduction)
* [Dockerfile](#dockerfile)
* [Dockerfile.build](#dockerfile.build)
* [local_module.py](#local_module.py)
* [onspot-s3-daily-homs.py](#onspot-s3-daily-homs.py)



## Brief Introduction
All of the previously described files in the *tap-onspot* document are the foundational code for the tap-onspot. Those files describe how the OnSpot API calls are made, formatted and processed.  The following explanation will describe the files that actually implement this process for Esquire on their AWS. The AWS architecture itself is well described in the Overview* and in the *Lambda Functions* and *S3* files. The rest of this document will be used to describe the python code that is condensed down to a Docker image on AWS ECR. 

The Docker image is built using 4 important files, *Dockerfile, Dockerfile.build, onspot-s3-daily-homs.py and *local_module.py*. There are also 3 completely empty files that are required but hold no further information within them, *requirements.txt. /__init/__.py *and another *\__init\__.py (for *local_module.py*). The requirements file is there to place necessary import libraries. Currently it is not being used but could be in the future just by adding required libraries ot this file and rebuilding the Docker image. 

## Dockerfile
This file only includes ``` FROM python:3 ```. This sets the base image and allows the docker Image to be built with two different bases. 

## Dockerfile.build
This file holds the majority of the information required to build the Docker image. This documentation will walk through each line of this file for clarity. 

```scala
FROM alpine:latest as stage1
RUN mkdir -p /root/.ssh
ARG PRIVATE_RSA_KEY=""
ENV PRIVATE_RSA_KEY=${PRIVATE_RSA_KEY}
RUN echo "${PRIVATE_RSA_KEY}" >> /root/.ssh/id_rsa
RUN chmod 600 /root/.ssh/id_rsa

RUN mkdir -p /root/.aws
ARG AWS_IAM_KEY=""
ARG AWS_IAM_SECRET=""
ENV AWS_IAM_KEY=${AWS_IAM_KEY}
ENV AWS_IAM_SECRET=${AWS_IAM_SECRET}
RUN echo "[default]" >> /root/.aws/credentials
RUN echo "region=us-east-2" >> /root/.aws/credentials
RUN echo "aws_access_key_id = ${AWS_IAM_KEY}" >> /root/.aws/credentials
RUN echo "aws_secret_access_key = ${AWS_IAM_SECRET}" >> /root/.aws/credentials
RUN chmod 600 /root/.aws/credentials

RUN apk update && apk add openssh-client && apk add --update build-base py-pip && \
    rm -rf /var/cache/apk/*
RUN ssh-keyscan -H github.com >> /root/.ssh/known_hosts
# Install Python Packages
COPY requirements.txt .
RUN pip install --upgrade pip --no-cache-dir -q -r requirements.txt

RUN apk add --no-cache --virtual .build-deps \
                build-base \
                libffi-dev \
                libxml2-dev \
                libxslt-dev \
                linux-headers \
                python3-dev \
                python3 \
                git \
        && pip3 install --upgrade setuptools boto3 \
        && mkdir /usr/local/onspot \
        && cd /usr/local/onspot \
    && python3 -m venv /usr/local/onspot/venvs/tap-onspot \
    && source /usr/local/onspot/venvs/tap-onspot/bin/activate \
    && pip install python-dateutil==2.8.0 \
    && git clone git@github.com:Esquire-Media/tap-onspot.git \
        && cd tap-onspot \
        && pip install . \
        && cd /usr/local/onspot \
    && python3 -m venv /usr/local/onspot/venvs/target-json \
    && source /usr/local/onspot/venvs/target-json/bin/activate \
    && pip3 install --no-cache-dir target-json 
ADD run_tap_scripts/onspot-s3-daily-homs.py /usr/local/onspot/venvs/onspot-s3-daily-homs.py
RUN mkdir /usr/local/onspot/venvs/script
ADD run_tap_scripts/script/local_module.py /usr/local/onspot/venvs/script/local_module.py
ADD run_tap_scripts/script/__init__.py /usr/local/onspot/venvs/script/__init__.py

ENTRYPOINT ["python3","/usr/local/onspot/venvs/onspot-s3-daily-homs.py"]
```

**Line 1** ``` FROM alpine_latest as stage1``` sets the base image as Alpine Linux. This is a very commonly used image base due to its small size, speed and security. 

**Line 2** ```RUN mkdir -p/root/.ssh/``` this will make the directory /root/.ssh/ if it doesnot already exist. 

**Line 3** ```ARG PRIVATE_RSA_KEY=""``` this sets the arguement inside of the Docker build. It will not persist in the final image and is just used for the build.

**Line 4** ```ENV PRIVATE_RSA_KEY=${PRIVATE_RSA_KEY}``` this sets the environmental variable. This variable will persist when a container is run from the result of this image. It is being set to the already established local variable PRIVATE_RSA_KEY, aka your github account private key. 

**Line 5** ```RUN echo "${PRIVATE_RSA_KEY}" >> /root/.ssh/id_rsa``` The echo command takes the variable PRIVATE_RSA_KEY and appends its to the file *id_rsa*. 

**Line 6*** ```RUN chmod 600 /root/.ssh/id_rsa``` This gives the "user", aka the image, full read and write access of the file *id_rsa*, while no other user can access the file.

* Now all GitHub access keys are set and saved to a file 


**Line 8-17** Similar to lines 2-6, it sets the AWS environmental variables to the file *.aws/credentials* and gives the image access

**Line 19-20** ```RUN apk update && apk add openssh-client && apk add --update build-base py-pip && \
    rm -rf /var/cache/apk/*``` This first updates the package list on Alpine Linux server. If this is successful, it installs the package openssh-client (the package used to connect to github ssh server). And if this is successful, it adds and updates the build-base (Alpine package to build the Docker image) and py-pip(Alpine package to use pip command) packages. If this is successful, it removes all files in the directory /var/cache/apk/. The -rf allows for recursive removal of the directory withouth any errors if one of the files is write-protected. 

**Line 21** ```RUN ssh-keyscan -H github.com >> /root/.ssh/known_hosts``` This adds the github ssh fingerprint to the local machine the image is being built upon. 

**Line 22-23** ```COPY requirements.txt .
RUN pip install --upgrade pip --no-cache-dir -q -r requirements.txt``` This copies the *requirements.txt* from the root folder this Docker image is being built upon. It then upgrades pip, disables the cache to allow for a smaller image, and installs all of the libraries inside the *requirements.txt* file. 

* the following lines 25 - 46 are all run in succussion with the success of the previous line being required for the next line to run. (This is determined by the **&&** between each line)

**Line 25 - 34** This set of code installs a bunch of libraries to a virtual "world". This allows the installation of all of these packages to be reverted easily by deleting the virtual "world". The main purpose in doing this is to keep your image as lean and light as possible because you can easily get rid of all of the packages once they are used.  

**Line 35 - 36** ```&& mkdir /usr/local/onspot \    && cd /usr/local/onspot \``` Makes the directory /usr/local/onspot and goes into this new directory. (cd = "change directory") 

**Line 37*** ```&& python3 -m venv /usr/local/onspot/venvs/tap-onspot \``` This line creates a virtual environment in the directory /usr/local/onspot/venvs/tap-onspot. A virtual environment is used to for dependency management and project isolation. It allows python packages to be installed locally for tht virtual environment isolated directory and not globally. The tap and target are seperated into different virtual environments to avoid any overlap or interaction between the two. 

**Line 38** ```&& source /usr/local/onspot/venvs/tap-onspot/bin/activate \``` This line activates the previously created virtual environment. 

**Line 39** ```&& pip install python-dateutil==2.8.0 \``` installs the python-dateutil package with the 2.8.0 version on the virtual environment only. 

**Line 40** ```&& git clone git@github.com:Esquire-Media/tap-onspot.git \``` clones the GitHub repo containing all of the previously described files used to tap OnSpot API into the virtual environment just created. 

**Line 41 -42** ```&& cd tap-onspot \ && pip install . \``` This will go into the GitHub repo directory and execute the *setup.py* file, which installs specific packages for the tap. 

**Line 43** ```&& cd /usr/local/onspot \``` Goes back to the base directory, as in outside of the tap virtual environment. 

**Line 44*** ```&& python3 -m venv /usr/local/onspot/venvs/target-json \``` creates a virtual environment directory for the target. 

**Line 45** ``` && source /usr/local/onspot/venvs/target-json/bin/activate \``` activates the target virtual environment.

**Line 46** ```&& pip3 install --no-cache-dir target-json``` installs the python package target-json that allows the target to save as a json file. 

**Line 46** ```ADD run_tap_scripts/onspot-s3-daily-homs.py /usr/local/onspot/venvs/onspot-s3-daily-homs.py``` This adds the file *onspot-s3-daily-homs.py* that is located in the directory we are building the image from to the directory /usr/local/onspot/venvs/onspot-s3-daily-homs.py. This is NOT inside either of the virtual environments but is one layer above both of them. 

**Line 47*** ```RUN mkdir /usr/local/onspot/venvs/script``` makes the directory ../script inside the same directory as the *onspot-s3-daily-homs.py*. The Dockerfile.build is trying to build a folder structure that replicates the Github repository it is located in. 

**Line 48** ```ADD run_tap_scripts/script/local_module.py /usr/local/onspot/venvs/script/local_module.py``` This then adds the *local_module.py* to the ../script folder. 

**Line 49** ```ADD run_tap_scripts/script/__init__.py /usr/local/onspot/venvs/script/__init__.py``` Adds the __init__.py file to the /script folder also. This file allows python to treat the ../script directory as a package or module. It allows for easier use of the functions defined in *local_module.py*. (Refer to this [link](https://stackoverflow.com/questions/448271/what-is-init-py-for) for more information regarding why the \__init\__.py is used. )

**Line 50** ```ENTRYPOINT ["python3","/usr/local/onspot/venvs/onspot-s3-daily-homs.py"]``` This uses the base image python3 created in the Dockerfile to execute the file *onspot-s3-daily-homs.py*. 


## local_module.py 
This file is used to define all necessary functions. Here are the functions defined in this file:
1. **create_local_pipeline_dir(source, pipeline)** This function creates a local directory for the output or the "target" and a local directory for the "temp_data". 
2. **get_load_type(source, pipeline)** This function returns the load_type, which is either **incremental** or **initial**.
3. **download_file(bucket, key, destination)** This function downloads the entered S3 file locally to the **destination** from AWS S3. 
4. **upload_file(source, bucket, key)** This function uploads a local file to AWS S3.
5. **upload_dir(dir, bucket, tap)** This function uploads all files in a given directory to AWS S3 all under the same folder. 
6. **upload_dir_split(dir, bucket, tap)** This function uploads all files in a given directory to a different folder on AWS S3 for each streamtype. (As in, the target from zipcodes will be uploaded to a zipcode/ folder while observations will be uploaded to observations/ folder all under the same over-arching target/ folder.) 
7. **change_tap_start_date(tap_config)** This function opens the locally saved *tap_config.json* file and updates the **start_date** to 30 days prior to today and then resaves the file locally. 


## onspot-s3-daily-homs.py
This file is what the Docker Image executes when initiated. It uses the functions defined in *local_module.py* to run the tap-onspot. It takes the following steps:
1. Imports functions from local_module
2. defines local variables. (The variable **pipeline** is defined as an environment variable on AWS Batch job definition.)
3. creates the necessary local directories using **create_local_pipeline_dir(source, pipeline)**. 
4. Uses **download_file(bucket, key, destination)**  to download all of of the 4 foundational files (*tap_config.json, catalog.json, state_previous.json,* and *target_config.json*) needed to run the tap-onspot from AWS S3 to the local directory. 
5. Uses **change_tap_start_date(tap_config)** function to update the **start_date** to 30 days ago. 
6. Defines the load_type using the **get_load_type(source, pipeline)** function. (This will always be **incremental** for Esquire's use.)
7. Runs the command line described in the *tap-onspot* document in the local terminal. This is the line that initiates the tap-onspot process and determines where to find the 4 foundational files to use for the process. It also points to the place to send all OnSpot API initial responses. 
8. Uses the  **upload_dir_split(dir, bucket, tap)**  function to upload the "target" (or the OnSpot API responses) to AWS S3.
9. Runs another os command line to take the tap-onspot *state.json* file, documenting all of the locations that were "tapped" and the date they were last tapped, and saves this file locally to *state_previous.json* file. This will update teh *state_previous.json* to the latest version of what has been tapped for the next run. 
10. Finally, it uses the **upload_file(source, bucket, key)** function to upload the modified *state_previous.json* and *tap_config.json* file. The other two foundational files (*target_config.json* and *catalog.json* will not change unless reconfiguration to the entire process is necessary.)