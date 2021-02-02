---
id: clickup-updates-sheet
title: Clickup Updates Sheet
sidebar_label: Clickup Updates Sheet
slug: /zendesk-clickup/clickup-updates-sheet
---

Google Sheet: https://docs.google.com/spreadsheets/d/1cs5IWl6JcRXcgpSC7Gz49s1YE-5HpkxEYFv9ABxwAwc/edit?usp=sharing

Zap url: https://zapier.com/shared/9c08cbf88fd5eeed3cfb6c5ff7fe4baa51348096

So this one is pretty basic:

1. New folder is created in Clickup
2. First word in the name of that folder is taken
3. Query salesforce for the first account with a name that starts with the same
   first word. Not great but best we can get without the sf_id. We could possibly
   prepend folder names with the sf_id and solve this issue. Would look weird and 
   isn't too secure though.
4. We then create a new row in the sheet if one doesn't exist already with the
   same folder name. If one does exist do nothing. If not then fill the row
   with: sf_id, folder_name, folder_id, default_folder_list_id.
5. Send mail notification out for a human to verify results.
   Right now it sends to noah@untitledfirm.com
