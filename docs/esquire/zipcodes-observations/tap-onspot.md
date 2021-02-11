---
id: tap-onspot
title: tap-onspot
sidebar_label: tap-onspot
slug: /esquire/zips_observations/tap-onspot
---


## Table of Contents 
* [Brief Introduction](#brief-introduction)
* [Command Line](#singer-io-tap-onspot)
* [4 Foundational Files](#4-foundational-files)
* [tap-onspot Files](#tap-onspot-files)

## Brief Introduction

Singer.io is a Stitch tool that describes how data extraction scripts called "taps" and data loading scripts called "targets" communicate, allowing for them to be used in any combination to get data from any source to any destination. It is an open-source tool that can "tap" such sources as Ebay, Facebook Ads, Google Ads, and MySQL and has such "targets" as csv, Stitch, or Google Sheets. The way this process is implemented is by creating a GitHub repository for each unique tap and target. The user will clone the git repo, and enter the given repo on their local machine. From here it is suggested to create a virtual environment for the "tap" code (or git repo) and a seperate virtual environment for the target code (or git repo) and run one line of code in the Command Line Interface (CLI). There are two main modes you can run the tap in, Discovery or Sync Mode. The Discovery mode is used to create the catalog.json file but once it is created will not be necessary. (In the case of OnSpot, this is already created and saved to S3 so will not ever be necessary). The Sync mode is used when you are trying to make the API call to retrieve data. 

The extended explanation of Singer.io can become long and complicated and is very dependent on which source and destination the user would like to use.  This is because it is an open-source tool so much of the code is written by many different authors. From here on out we will be speaking of singer.io taps in reference to OnSpot specifically, however much of this information can be related back to use with other taps and targets. The tap-onspot code is written by the company Bytecode. It establishes a base tap code so that a user can clone the Bytecode tap-onspot repository, create the 4 foundational files for taps (tap_config.json, catalog.json, state.json, and target_config.json), and run one line in their command line to make calls to the OnSpot API and recieve responses on S3 AWS. This tap-onspot code can be used by any company with access to OnSpot API. The following documentation will walk through the outline of each file in this repository to help bring more clarity to what the initial command line is doing and how the foundational files are used. It will describe the base tap files and the following other documentation page *Build tap-onspot Docker Image* will describe how Esquire uses the tap-onspot code in their zipcodes and observations process. 


## Command Line

The one line that is used inside the code that hosts tap-onspot for Esquire on their AWS Architecture is:
 ```tap-onspot --config tap_config.json --catalog catalog.json --state state_previous.json | target --config target_config.json > state.json``` 
 Let us walk through what each part of this command does. It begins with ```tap-<type of tap>``` , where the "type of tap" could be "facebook" or "google", or for this case, the command begins with ```tap-onspot```. This CLI line is defined in the git repo file *setup.py*. Here the entrypoint is defined as a "console_scripts" that when the string "tap-onspot" is written in the command line it will direct the user to the tap_onspot:main function and initiate the entire repo depending upon which commands follow "tap-onspot". 

 The next part is ```--config```. This command is used to define the tap configuration file, which holds all of the parameters that are necessary to run this tap. 

 The ```--catalog``` is used to point to the the *catalog.json* file. This hold the all of the streams with their unique identifier, their schema, and their metadata. For the case of OnSpot API, the *catalog.json* file holds the *tap_stream_id* "zipcodes", "observations", and "devices". This file is used specify which streams will be included in this tap and specifically what metadata will be synced. The schema also allows the tap to mitigate JSON compatability issues. These issues inclue specifying data types (example distinguishing between integer and number) and defining the structure of the incoming data. The metadata is useful to define which nodes will be included and further information about how you would like that node treated when syncing to the API. For example you can choose if the field should be "selected" or if "inclusion" should be *available* or *automatic* or *unsupported*. (Further information regarding the --catalog on a grander scale can be found [here](https://github.com/singer-io/getting-started/blob/master/docs/DISCOVERY_MODE.md#the-catalog).) Currently the on-spot *catalog.json* has "devices" marked as ```"selected":false``` and therfore we are not collecting "devices" data. If we were to decided to include "devices" in the future it would only require editting the *catalog.json* file on AWS S3 and change "selected" to "true".

 The  ```--state--``` command is used to point to the *state_previous.json*. As the name suggests, this file is used to hold, or bookmark the results from the previous syncing with the OnSpot API. It holds each **location_id** (ie. EF~#####) with the datetime it was last synced. (EX) "EF~23526":"2021-02-07T23:59:59" . This is then checked for every location_id everytime you would like to sync. 

 The ```|``` is a "pipe". It will take the output from the tap on the left side of the pipe, and *pipes* it to the right side. It is a "command to command" redirection.

 The ```--config``` command will again set the parameter arguements defined in the *target_config.json* . 

 Finally, the ```>``` command will take the "target" file, which is purely the output file with the arguements defined by the target, and send it all into a file called *state.json* which bookmarks this sync.  You will now have the output of the API call saved to whichever local file you are currently in. 


## 4 Foundational Files
Following off of how each file is used in the command line, below is a better undertanding of the values present in each file. 

### tap_config.json
The file containing all parameter arguements. 

 - `os_gateway_id`: First part of OnSpot URL (ie. The url will be https://<**os_gateway_id** >.execute-api.< **os_region** >.amazonaws.com/< endpoint >)
   - `os_region`: OnSpot API AWS Region
   - `os_stage`: OnSpot API Stage (This is `Prod` )
   - `os_access_key`: OnSpot API AWS Access Key
   - `os_secret_key`: OnSpot API AWS Secret Key
   - `os_api_key`: OnSpot API AWS API Key/Token
   - `os_callback_url`: Esquire API Gateway URL for OnSpot Async Responses to be sent to
   - `os_latency_days`: Integer number of days before today's date to look-back and re-process to deal with latency/delay in stable/consistent measures (set to 30 days)
   - `s3_access_key`: Esquire S3 AWS service account access key
   - `s3_access_key`: Esquire S3 AWS service account secret key
   - `s3_bucket`: Esquire S3 Bucket for OnSpot input/output files
   - `s3_output_folder`: Esquire S3 Folder for OnSpot output files (requests, responses, combined, target)
   - `s3_locations_folder`: Esquire S3 Folder for OnSpot input location files (files with GeoFeature GeoJSON info)
   - `s3_locations_prefix`: Locations input file prefix for each job/pipeline instance
   - `start_date`: Absolute start date (minimum date) for initial load

    ```json
    {
        "os_gateway_id": "ON_SPOT_GATEWAY_ID",
        "os_region": "us-east-1",
        "os_stage": "Prod",
        "os_access_key": "YOUR_ON_SPOT_ACCESS_KEY",
        "os_secret_key": "YOUR_ON_SPOT_SECRET_KEY",
        "os_api_key": "YOUR_ON_SPOT_API_KEY",
        "os_callback_url":"YOUR_CALLBACK_WEBHOOK_URL",
        "os_latency_days": "5",
        "s3_access_key": "YOUR_S3_ACCESS_KEY",
        "s3_secret_key": "YOUR_S3_SECRET_KEY",
        "s3_bucket": "YOUR_S3_BUCKET",
        "s3_output_folder": "YOUR_S3_OUTPUT_FOLDER",
        "s3_locations_folder": "YOUR_S3_LOCATION_FOLDER",
        "s3_locations_prefix": "LOCATION_FILE_PREFIX",
        "start_date": "2019-17-01T00:00:00Z"
    }
    ```


### catalog.json
This file holds the information regarding schema, tap_stream_id, and metadata. Below is an example piece of the schema and metadata for "Zipcodes".

SCHEMA
```json
{
      "stream": "zipcodes",
      "schema": {
        "properties": {
          "start": {
            "type": [
              "null",
              "string"
            ],
            "format": "date-time"
          },
          "end": {
            "type": [
              "null",
              "string"
            ],
            "format": "date-time"
          },
          "success": {
            "type": [
              "null",
              "boolean"
            ]
          },...}}}
          ```
METADATA
```json
"metadata": [
        {
          "breadcrumb": [
            "properties",
            "total_matched"
          ],
          "metadata": {
            "inclusion": "available"
          }
        },
        {
          "breadcrumb": [
            "properties",
            "response_id"
          ],
          "metadata": {
            "inclusion": "automatic"
          }
        }...}]..

 ```
### state.json
This file bookmarks the previously synced datetime for the given location. Because of the latency and delay issues with the OnSpot API, the bookmark is saved but every location will be processed for a look-back window of 30 days regardless of the last time it was bookmarked. (This is unless it was bookmarked the same day you are trying to resync.)
EX) For Observations
```json
{"bookmarks":
 		{"observations": 
 				{"EF~19978": "2021-02-07T23:59:59", 
 				 "EF~20298": "2021-02-07T23:59:59", 
 				"EF~21025": "2021-02-07T23:59:59",....}}}
 ```

### target_config.json 
This file is used for parameter arguements to pass to the target output file. This file is short and simple for OnSpot. It is purely used for formatting.

```json
{
  "delimiter": "\n"
}
```


## tap-onspot Files:

The following files are what make the one command line useable. A user simply has to be in a directory with the following files, and the above foundational files, with the correct python packages to run the command described above to "tap" the OnSpot API. 

### __init__.py
This file contains the main() function that will automatically be run when the entire git repo is run in the command line. The main function has 3 main tasks:
1. Parses/loads all variable arguements. (tap_config, catalog and state)
* There are a few REQUIRED_CONFIG_KEYS that are all specified inside the *tap_config.json* file 
2. Connects to S3 client and OnSpot Client using these arguements
3. Triggers the sync() or do_discover() function based on which mode the user is using 

### setup.py 
This file is the first file that is used when you run the command line described above. It declares the following things:
1. **name=** gives the name project and how it will be listed on PyPI
2. **version=** gives the version of your project that is displayed to PyPI (if published).
3. **description=** gives the short description that will also be on PyPI if publsihed. 
4. **author=** gives details about the author.
5.  **classifiers=[...]** gives additional metadata about the package. Specifies the package is only compatible with python3. However, this does NOT install python3 and still needs to be installed sepeperately from this statement.
6. **py_modules=[...]** lists all modules used for **setuptools**. In the case of tap-onspot it lists the entire **tap_onspot/** directory
7. **install_requires=[...]** when project is installed by **pip**, it will install these dependency packages. 
8. **entry_points=** sets the entry_point of this project to the main() function defined in the *\__init\__.py file. This function brings together all of the other files to one function. 
9. **packages=** sets packages, sub-packages etc. in the project using findpackages() function. 
10. **package_data=** this maps the packages that are previously declared called **tap_onspot** to the * 'schemas/*.json'* files needed inside of this package. 

### client.py
This file is used to connect to the S3 Client and OnSpot Client. For each Client it defines 3 main pieces:
1. the authorization header
2. possible exception errors
3. functions that can be used inside the other files once the client is defined. (ex. S3Client.get_file_obj_from_S3())

And for the OnSpot Client it defines how API calls will be made using the python library **requests**. 

### discover.py
This file is used when the Discovery Mode is used. It follows these steps.
1. uses the *schema.py* file's function get_schema() to get all of the schema information that is already established in the **schema/** folder files. 
2. itterates through each stream_name and sets the variables **schema** and **mdata** for each stream)
3. It then appends these values to the Catalog using the singer.catalog tool
4. it returns the *catalog.json* file
For our case, this should never have to be run unless you would like to add another stream to this process. 


### schema.py
This file is used to get the inforamtion from the **schemas/** folder.
1. It itterates through the streams defined in the *streams.py* file, and opens the file from the **schemas/** folder with these stream names. (ie. "zipcodes", "observations", "devices")
2. once a file is open, it defines the schema and metadata for that stream. It uses the singer.metadata to format the metadata with the required format and fields.
3. returns the schemas and metadata for each stream_name


### streams.py
This file is used purely to define the **STREAMS** variable that is used in a few of the other files. For each stream it defines the **path** (url path on OnSpot API), the **key_properties** (the primary key for this stream), the **replication_method** (how you would like data replicated, either INCREMENTAL or FULL TABLE), and finally the **replication_keys** (bookmark fields, typically datetime). 

### schemas/
This is the folder that holds a file for each distinct stream_name. It holds *devices.json*, *observations.json*, and *zipcodes.json*. If you would ever like to add another endpoint/stream_name the first step would be creating another file for this endpoint in the **schemas/** folder.

### sync.py
This is the core of this git repository. It holds the sync() function that brings all of the pieces together and makes the actual calls to OnSpot API. 
1. Defines the **start_date** for the process based on the *tap_config.json* file
2. uses singer.get_currently_syncing(state) to finds the last/currently syncing streams
3. uses singer.catalog.get_selected_streams() to find which stream_names are "selected". (ie. "zipcodes" and "observations")
4. defines where the input location files are located on S3 and the output S3 location is using the *tap_config.json* file. Also downloads all location_files locally. 
5. itterates through each stream_name in STREAMS defined in *streams.py* 
6. Checks if it is in the select_streams from the catalog. (If it is not it will not run through the rest of sync() function)
7. Sets the start time to right now and Logs this time. ("START Syncing: < stream_name >, Start Time: < datetime now >')
8. updates the state to "currently syncing" for the given stream_name using singer.bookmark.set_currently_syncing()
9. itterates through each input location_file. 
10. Checks to ensure the location file is a json file and that it contains *esquire_locations* in the filename. (if not the file will be skipped.)
11. json.loads the current location file and itterates through each "feature" in this file. Each "feature" will be a different location_id (EA~#####), with its geojson of its polygon coordinates.
12. Finds the min_bookmark_value and max_bookmark_value and logs these values. These variables are useless and never used for the rest of the process. The logic used to solve for them results in every location returning the same min_bookmark_value and max_bookmark_value exactly 30 days back. 
13. Uses a long set of python logic to set the start_date to 30 days ago and the end_date to 2 days ago. This is the same for every single location. 
14. Itterates through each date in the list of dates between start_date and end_date 
15. Checks if bookmark_dt <= query_date or days_to_go <= latency_days. This check should work for every location because **latency_days**=30 and **days_to_go** is a count of how many dates have been processed and should go up to 29 days in total. Every location will run for every date. (between 30days ago and 2 days ago).
16. Logs each location and date the OnSpot API wil be running for
17. Make the OnSpot API call for all locations in the current "body" for the current date. This should be all 50 locations that were in the input location file. 
18. It checks if there was an error in the respoonse... 
19. If there was NOT an error, it will upload a newly formatted request file to S3
20. If there was an error it will upload the error to S3 and logs the error
21. Updates the bookmark_date
22. Logs that the sync is completed. In total OnSpot API will be called once for each input_location file for each date between 30 days ago and 2 days ago. Each input location file has 50 locations (except for the last file)

