const ELEMENT_IDENTIFIERS = {
  APPOINTMENT: "appointment",
  LEADS_URL_PATH: "lead-management/leads/edit",
  CUSTOMER_DETAILS: "editable-details",
  CUSTOMER_DEVICE_CLASS: ".device-customer",
  DEVICE_DETAIL_ITEM_CLASS: ".device-detail",
  CUSTOMER_DEVICE_DETAIL_CLASS: ".device-customer",
  CUSTOMER_CONTACT_PREFS_CLASS: ".col-xs-12.contact-details",
  CUSTOMER_CONTACT_PREF_NAMES:{
    Sms: "customer_sms",
    Email: "customer_email"
  },
  CUSTOMER_DETAILS_SAVE_BTN_CLASS: "btn btn-confirm fastclickable",
  ITEM_LIST: "sale-item-list",
  SIDE_BUTTONS_PANEL: "bar-buttons",
  SIDE_BUTTIONS:{
    Notes: "Notes",
    Customer: "Customer"
  },
  SIDE_BUTTIONS_CLASS:{
    Notes: "btn blue fastclickable",
    Customer: "btn yellow fastclickable"
  },
  NOTE_BUTTONS_CLASS:{
    Sms: "btn rounded lead-create-sms-btn fastclickable btn-default",
    Email: "btn rounded lead-create-email-btn fastclickable btn-default",
    Create: "btn btn-confirm left-icon pull-right fastclickable"
  },
  NOTE_ACTIONS_CLASS: "editor-add-in ng-pristine ng-valid ng-not-empty ng-touched",
  NOTE_OPTIONS:{
    AwaitingCustomer: "Awaiting Customer"
  },
  NOTE_TEXTAREA: "note-editable",
  TOAST_MESSAGES:{
    CUSTOMER_UPDATED: "Customer Updated"
  },
  
};

const DEVICE_KEYWORD =  {
    Iphone: "iphone",
    Samsung: "samsung",
    Google: "google",
};

const COMPANIES = {
  AsurionMobility: "Asurion Mobility",
  HomePlus: "Asurion Home+ Repairs",
  RemoteTech: "Asurion Remote Tech",
  Verizon: "Verizon Extended Warranty",
  None: "N/A",
};

const LEAD_MESSAGE = {
    [COMPANIES.AsurionMobility]:{
      Default : `Hi, this is UBreakiFix. We have your insurance claim and are ready to begin the repair! Phone repairs “usually” take about 3 hours to complete. Same day repair cut off time is 4pm Mon-Sat. `,
      [DEVICE_KEYWORD.Iphone]: `Hi! This is UBreakiFix. We have your insurance claim. Please turn off the setting "Find my iPhone". Phone repairs “usually” take about 3 hours to complete. Same day repair cut off time  is 4pm Mon-Sat.`
    },
    [COMPANIES.HomePlus]:{
      Default: `Hi, this is UBreakiFix. We have your insurance claim and are ready to begin the repair! The repair for your Device takes about 5 to 7 days, please make sure to back up any data if possible.`
    },
    [COMPANIES.RemoteTech]:{
      Default: `Hi, this is uBreakiFix. We have your insurance claim! You will need to be at your repair location for the entirety of your repair window until it has been completed.`,
      [DEVICE_KEYWORD.Iphone]: `Hi, this is uBreakiFix. We have your insurance claim! You will need to be at your repair location for the entirety of your repair window until your repair has been completed. Please remember to turn off the setting "Find my iphone".`
    },
    
}

