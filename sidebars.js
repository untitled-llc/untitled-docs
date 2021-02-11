module.exports = {
  someSidebar: {
    Canopy: ['canopy/getting-started','canopy/system-architecture','canopy/environments','canopy/dev-flow','canopy/changelog','canopy/runbook'],
    'Zendesk/ClickUp Automation': ['zendesk-clickup/zendesk-to-clickup','zendesk-clickup/clickup-updates-sheet','zendesk-clickup/clickup-to-zendesk'],
    'Field Guide': ['field-guide'],
    Esquire: ['esquire/overview',
             { type: 'category', 
               label:'Zipcodes and Observations', 
                     items: ['esquire/zipcodes-observations/overview','esquire/zipcodes-observations/tap-onspot','esquire/zipcodes-observations/lambda', 'esquire/zipcodes-observations/s3','esquire/zipcodes-observations/redshift-glue', 'esquire/zips_observations/esquire/zipcodes-observations/docker-image']}, 
             { type: 'category', 
               label:'Ads Metrics', 
                     items: ['esquire/ads-metrics/overview', 'esquire/ads-metrics/facebook', 'esquire/ads-metrics/xandr', 'esquire/ads-metrics/eltoro']},
             { type: 'category', 
               label:'Ads Automation', 
                     items: ['esquire/ads-automation/overview', 
                              { type: 'category', 
                                label:'New Movers', 
                                       items: ['esquire/ads-automation/new-movers/overview', 'esquire/ads-automation/new-movers/s3','esquire/ads-automation/new-movers/lambda','esquire/ads-automation/new-movers/redshift-glue' ]
                              },
                              { type: 'category', 
                                label:'Venue Replay/ InMarket Shoppers', 
                                       items: ['esquire/ads-automation/venue-replay/overview', 'esquire/ads-automation/venue-replay/s3','esquire/ads-automation/venue-replay/lambda','esquire/ads-automation/venue-replay/redshift-glue' ]
                            } ]
              },
             { type: 'category', 
               label:'Salesforce Architecture', 
                     items: ['esquire/salesforce/overview']},
             { type: 'category', 
               label:'Avrick Movers', 
                     items: ['esquire/avrick-movers/overview','esquire/avrick-movers/lambda', 'esquire/avrick-movers/s3']}
                    ],
    Docusaurus: ['doc1', 'doc2', 'doc3'],
    Features: ['mdx', 'untitDocs']
  },
};
