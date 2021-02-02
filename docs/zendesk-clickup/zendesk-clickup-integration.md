---
id: zendesk-to-clickup
title: Zendesk to Clickup
sidebar_label: Zendesk to Clickup
slug: /zendesk-clickup/zendesk-to-clickup
---

Zap url: https://zapier.com/shared/85e9ba8b3a63cbfa2fb3d41b29bbd4087a316ab6

This one gets a little complex and isnt perfect but it's managable:

1. New ticket is created in Zendesk

2. Priority is parsed from ticket and translated to an id using a zapier lookup
   table. This is literally just a key/value map (dictionary).

3. Parse the first word from the zendesk company name. This is often different
   from Salesforce as well as the folder name in clickup. Chaos ensues from
   this point forward 😁

4. Using that first word we will lookup the company in salesforce. This is not
   a perfect system and multiple results can come from salesforce. To remedy
   this issue, for now, we take that first word and expand or change it so we
   get the result we want. 

   - e.g. Louisville Water would be reduced to just "Louisville" in the
     previous step. We also serve the Louisville Zoo. Fortunately, right now,
     we only are actively working with Louisville Water so we can assume that's
     the company that's opening zendesk tickets. We should fix this somehow in
     the future by passing the salesforce_id from zendesk.

5. Next we search salesforce using the result from the last step. We use a SQL
   Query that does a wildcard search: 

```sql
Name LIKE '[step 4 output]%'
```

6. Using the salesforce account object returned in step 5 we will lookup a row
   in [this google sheet](https://docs.google.com/spreadsheets/d/1cs5IWl6JcRXcgpSC7Gz49s1YE-5HpkxEYFv9ABxwAwc/edit?usp=sharing).
   This will return the following fields: `salesforce_id`, `clickup_folder_name`,
   `clickup_folder_id`, `default_list_id`. If there is nothing found we will create
   a new row that associates the sf_id with a folder/list in clickup called
   `unsorted` for a Project Manager to sort out later. This will also catch 
   all future tickets for this company until someone updates the file.
7. Create a task based on info from zendesk and place it in the folder and
   list we looked up in step 6. We link the original zendesk ticket in the 
   description as well as a client contact email. This task is automatically
   assigned to the Project Manager for delegation.

