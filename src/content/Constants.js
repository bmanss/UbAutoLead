const ELEMENT_IDENTIFIERS = {
  APPOINTMENT: ".appointment",
  LEADS_URL_PATH: "lead-management/leads/edit",
  LOADING_BAR: "#loading-bar",
  CUSTOMER_DETAILS: ".editable-details",
  CUSTOMER_DEVICE_CLASS: ".device-customer",
  DEVICE_DETAIL_ITEM_CLASS: ".device-detail",
  CREATE_NOTE_ID: "#create-note-container",
  CUSTOMER_DEVICE_DETAIL_CLASS: ".device-customer",
  CUSTOMER_CONTACT_PREFS_CLASS: ".col-xs-12.contact-details",
  CUSTOMER_CONTACT_PREF_NAMES: {
    Sms: "customer_sms",
    Email: "customer_email",
  },
  CUSTOMER_DETAILS_SAVE_BTN_CLASS: ".btn.btn-confirm.fastclickable",
  ITEM_LIST: "sale-item-list",
  SIDE_BUTTONS_PANEL: ".bar-buttons",
  SIDE_BUTTIONS: {
    Notes: "Notes",
    Customer: "Customer",
  },
  SIDE_BUTTIONS_CLASS: {
    Notes: ".btn.blue.fastclickable",
    Customer: ".btn.yellow.fastclickable",
  },
  NOTE_BUTTONS_CLASS: {
    Sms: ".btn.rounded.lead-create-sms-btn.fastclickable.btn-default",
    Email: ".btn.rounded.lead-create-email-btn.fastclickable.btn-default",
    Create: ".btn.btn-confirm.left-icon.pull-right.fastclickable",
  },
  NOTE_CONTACT_MODAL_ID: "#add-attachments-modal",
  NOTE_ACTIONS_CLASS: ".editor-add-in",
  NOTE_TEXTAREA: "note-editable",
  NOTE_CONFRIM_ROW_CLASS: ".row.confirm-button",
  CONFIRM_BTN_CLASS: "btn-confirm",
  NOTE_SMS_BTN_CLASS: "lead-create-sms-btn",
  NOTE_EMAIL_BTN_CLASS: "lead-create-email-btn",
};
const LEAD_STATUS = {
  AwaitingCustomer: "Awaiting Customer",
  NeedContact: "Need to Contact",
  Missed: "Missed Appointment",
  NeedParts: "Need to Order Parts",
}

const DEVICE_KEYWORD = {
  Iphone: "iphone",
  Samsung: "samsung",
  Google: "google",
};

const COMPANIES = {
  AsurionMobility: "Asurion Mobility",
  AsurionAmazon: "Asurion Amazon",
  GooglePreferred: "Google Preferred Care",
  HomePlus: "Asurion Home+ Repairs",
  RemoteTech: "Asurion Remote Tech",
  Servify: "Servify Samsung Care+",
  Verizon: "Verizon Extended Warranty",
  None: "N/A",
};

const LEAD_MESSAGE = {
  [COMPANIES.AsurionMobility]: {
    Default: `Hi, this is UBreakiFix. We have your insurance claim and are ready to begin the repair! Phone repairs “usually” take about 3 hours to complete. Same day repair cut off time is 4pm Mon-Sat. `,
    [DEVICE_KEYWORD.Iphone]: `Hi! This is UBreakiFix. We have your insurance claim. Please turn off the setting "Find my iPhone". Phone repairs “usually” take about 3 hours to complete. Same day repair cut off time  is 4pm Mon-Sat.`,
  },
  [COMPANIES.AsurionAmazon]: {
    Default: `Hi, the is uBreakiFix. We have your Asurion Buy Out Claim! Please bring in your device so that we can process your claim. Your old device will remain with us for processing, and your new device will be shipped to you by Amazon!`,
  },
  [COMPANIES.GooglePreferred]: {
    Default: `Hi, this is UBreakiFix. We have your insurance claim and are ready to begin the repair! Phone repairs “usually” take about 3 hours to complete. Same day repair cut off time is 4pm Mon-Sat.`,
  },
  [COMPANIES.HomePlus]: {
    Default: `Hi, this is UBreakiFix. We have your insurance claim and are ready to begin the repair! The repair for your Device takes about 5 to 7 days, please make sure to back up any data if possible.`,
  },
  [COMPANIES.RemoteTech]: {
    Default: `Hi, this is uBreakiFix. We have your insurance claim! You will need to be at your repair location for the entirety of your repair window until it has been completed.`,
    [DEVICE_KEYWORD.Iphone]: `Hi, this is uBreakiFix. We have your insurance claim! You will need to be at your repair location for the entirety of your repair window until your repair has been completed. Please remember to turn off the setting "Find my iphone".`,
  },
  [COMPANIES.Servify]: {
    Default: `Hello, this is UBreakiFix. We see that we have an appointment for your device. We have a few questions about your device. If possible, contact us at your earliest convenience at 803-520-8285.`,
  },
  [COMPANIES.Verizon]: {
    Default: `Hi, this is UBreakiFix. We have your Verizon extended warranty claim! We have all the parts we need and are ready to begin your repair. Phone repairs “usually” take about 3 hours to complete. Same day cut off time is 4pm Mon-Sat.`,
  },
  [COMPANIES.None]: {
    New: `Hello, this is UBreakiFix. We see that we have an appointment for your device. We have a few questions about your device. If possible, contact us at your earliest convenience at 803-520-8285.`,
    Missed: `Hello, this is Ubreakifix. We noticed you have missed the appointment for your device. Please contact us at 803-520-8285 at your earliest convenience to reschedule your appointment.`,
    Default: `Hello this is UBreakiFix. Please give us a call about your device at your earliest convenience at 803-520-8285`,
  },
};

// --- Quote ---
// Hello, this is UBreakiFix. We have an appointment for your device. The quote for this repair is $price before tax. Be sure to stop by or give us a call at your earliest convenience so we can reserve or order parts for you.
