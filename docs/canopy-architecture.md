---
id: canopy-system-architecture
title: Canopy System Architecture
sidebar_label: System Architecture
slug: /canopy/architecture
---

## Canopy Portal Documentation
This the main document relating to documentation of the development of the Canopy Certified Inc. Business Portal. The portal, built with React, utilizes a variety of integrated AWS, Salesforce, and FormAssembly services to help businesses keep on track to becoming Certified B-Corps. Documentation for the portal will be updated as necessary to reflect the latest and/or breaking releases of the application.

#### Table of Contents

1. System Architecture
    - Diagram

##### System Architecture

![Canopy System Archetecture Diagram](https://raw.githubusercontent.com/untitled-llc/untitled-docs/main/static/img/Canopy%20Stack.jpg)

## Event Based Flow Diagrams

#### Signup

![Sign Up](https://raw.githubusercontent.com/untitled-llc/untitled-docs/main/static/img/Canopy%20Stack.jpg)

#### Form Submission and Archive Process

![Form Submission and Archive Process](https://raw.githubusercontent.com/untitled-llc/untitled-docs/main/static/img/Canopy%20Stack.jpg)


Salesforce will pre-fill all forms whenever viewed on the portal. If the form has not been completed yet, it will show up as a blank form, otherwise all previous forms will be filled out as submitted.   

Each form entry is saved in Salesforce under the Custom Object for the given form. For example, the Application Form is saved under the custom object Initial_Onboarding_Forms__c. Salesforce has a record for each company. The record will hold the latest response for each Company. So if a company re-enters a form, Salesforce will hold the answers on the latest response. 

DynamoDB forms-src holds the history of all forms. So the primary key for the table is sf_id and the form_id. The sf_id is the unqiue identifier assigned by Salesforce to each Account (or company). The  form_id is a combination of form_url_id and the response_id.  The form_url_id  is the distinct id written into its' url that distinguishes each unique form. (For example. the Application form url is: https://canopy.tfaforms.net/5 and therefore its form_url_id is "5". ) The response_id is a unique number that is given to each submission to a form. It increase with each submission of any form. The increased number is not unique to that form only. 


So an example of a primary key on forms-src for a company called Test for one of its Application submissions would be:  sf_id = "b0X3s00000BfGAhECN" and form_id = "5_415"


Once a form is submitted it will be up for review by a Canopy employee. The Canopy employee will decide if it is  accepted or denied or requests a follow up. They will click an action button the Salesforce website that will send their decision to an API Gateway and then back to forms-src dynamo table. The Canopy portal will use AppSync and GraphQL API to get infromation from dynamodb and show Canopy's response on the frontend (or portal).  


#### Form Point System

![Form Point System](https://raw.githubusercontent.com/untitled-llc/untitled-docs/main/static/img/Canopy%20Stack.jpg)
