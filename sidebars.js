module.exports = {
  someSidebar: {
    Canopy: ['canopy-getting-started','canopy-system-architecture','canopy-environments','canopy-dev-flow','canopy-changelog','canopy-runbook'],
    'Zendesk/ClickUp Automation': ['zendesk-to-clickup','clickup-updates-sheet','clickup-to-zendesk'],
    'Field Guide': ['field-guide'],
    Esquire: ['esquire-overview',
             { type: 'category', 
               label:'Zipcodes and Observations', 
                     items: ['esquire-zo-overview','esquire-zo-lambda', 'esquire-zo-s3','esquire-zo-redshift-glue']}, 
             { type: 'category', 
               label:'Ads Metrics', 
                     items: ['esquire-ads-metrics-eltoro', 'esquire-ads-metrics-googleads']},
             { type: 'category', 
               label:'Ads Automation', 
                     items: ['esquire-auto-overview', 
                              { type: 'category', 
                                label:'New Movers', 
                                       items: ['esquire-auto-NM-overview', 'esquire-auto-NM-s3','esquire-auto-NM-lambda','esquire-auto-NM-redshift-glue' ]
                              },
                              { type: 'category', 
                                label:'Venue Replay/ InMarket Shoppers', 
                                       items: ['esquire-auto-VR-overview', 'esquire-auto-VR-s3','esquire-auto-VR-lambda','esquire-auto-VR-redshift-glue' ]
                            } ]
              },
             { type: 'category', 
               label:'Salesforce Architecture', 
                     items: ['esquire-sf-overview']},
             { type: 'category', 
               label:'Avrick Movers', 
                     items: ['esquire-avz-overview','esquire-avz-lambda', 'esquire-avz-s3']}
                    ],
    Docusaurus: ['doc1', 'doc2', 'doc3'],
    Features: ['mdx', 'untitDocs']
  },
};
