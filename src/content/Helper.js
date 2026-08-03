const Elements = ELEMENT_IDENTIFIERS;

/** Builds a partial class-name selector, e.g. ClassContains("btn-confirm"). */
function ClassContains(className) {
  return `[class*="${className}"]`;
}

/** Builds a [name="..."] selector. */
function NameSelector(name) {
  return `[name="${name}"]`;
}

/** Single element or null. Safe against a null/missing parent. */
function Query(parent, selector) {
  return parent?.querySelector?.(selector) ?? null;
}

/** Always an array, never a live NodeList. */
function QueryAll(parent, selector) {
  return Array.from(parent?.querySelectorAll?.(selector) ?? []);
}

/** Result-object form, kept for callers that branch on Success. */
function TryQuerySelector(parent, selector) {
  const element = Query(parent, selector);
  return { Success: element !== null, Element: element };
}

/** Options of a <select> as an array, so no caller has to touch .options. */
function QueryOptions(selectEl) {
  return Array.from(selectEl?.options ?? []);
}

function QuerySelectedOption(selectEl) {
  return QueryOptions(selectEl)[selectEl?.selectedIndex] ?? null;
}

/** Trimmed text of any node, or null. */
function GetText(element) {
  const text = element?.textContent?.trim();
  return text ? text : null;
}

/** Trimmed text of the `.details` value inside a detail row, or null. */
function GetDetailValue(rowElement) {
  return GetText(Query(rowElement, Elements.DETAIL_VALUE_CLASS));
}

/** Sets a checkbox and notifies the framework. Returns true if it changed. */
function SetCheckbox(element, checked) {
  if (!element || element.checked === checked) return false;
  element.checked = checked;
  element.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

/** Sets an input/textarea value and notifies the framework. */
function SetInputValue(element, value) {
  if (!element) return false;
  element.value = value;
  element.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}

/** Selects an option by index and notifies the framework. */
function SetSelectedIndex(selectEl, index) {
  if (!selectEl) return false;
  selectEl.selectedIndex = index;
  selectEl.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

/** Clicks a button even if the framework has it disabled. */
function ForceClick(button) {
  if (!button) return false;
  button.disabled = false;
  button.click();
  return true;
}

function WaitForElement(selector, parent = document, timeout = TIMEOUTS.Default) {
  return new Promise((resolve) => {
    if (!parent) return resolve(null);

    const existing = Query(parent, selector);
    if (existing) return resolve(existing);

    const observer = new MutationObserver(() => {
      const element = Query(parent, selector);
      if (element) {
        clearTimeout(timer);
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(parent === document ? document.body : parent, { childList: true, subtree: true });

    const timer = setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

function WaitForElementChange(element, checkFn, timeout = TIMEOUTS.Default) {
  return new Promise((resolve) => {
    if (!element) return resolve(null);
    if (checkFn(element)) return resolve(element);

    const observer = new MutationObserver(() => {
      if (checkFn(element)) {
        clearTimeout(timer);
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(element, { attributes: true, childList: true, subtree: true, characterData: true });

    const timer = setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

function WaitForElementRemoved(element, timeout = TIMEOUTS.Default) {
  return new Promise((resolve) => {
    if (!element || !element.isConnected) return resolve(true);

    const observer = new MutationObserver(() => {
      if (!element.isConnected) {
        clearTimeout(timer);
        observer.disconnect();
        resolve(true);
      }
    });

    observer.observe(element.parentNode ?? document.body, { childList: true, subtree: true });

    const timer = setTimeout(() => {
      observer.disconnect();
      resolve(false);
    }, timeout);
  });
}

async function WaitForLoadingBar() {
  const loadingBar = await WaitForElement(Elements.LOADING_BAR, document, TIMEOUTS.Instant);
  if (loadingBar) await WaitForElementRemoved(loadingBar);
}

/** Waits for a button to become disabled, which is how this app signals "submitted". */
function WaitForButtonDisabled(button) {
  return WaitForElementChange(button, (el) => el.disabled === true);
}

/* ----------------------------------------------------------------------------
 * 2. Side panel
 * --------------------------------------------------------------------------*/

async function ToggleSidePanel(panelType) {
  const sideButtonClass = Elements.SIDE_BUTTIONS_CLASS[panelType];
  if (!sideButtonClass) {
    console.log(`Unknown side panel type: ${panelType}`);
    return false;
  }

  const sidePanelEl = await WaitForElement(Elements.SIDE_BUTTONS_PANEL);
  const sideButton = await WaitForElement(sideButtonClass, sidePanelEl, TIMEOUTS.Short);
  if (!sideButton) return false;

  sideButton.click();
  return true;
}

/**
 * Opens a side panel and waits for its content. The panel occasionally comes up
 * empty, so one retry (close + reopen) is built in.
 */
async function OpenSidePanel(panelType, contentSelector) {
  await ToggleSidePanel(panelType);

  const content = await WaitForElement(contentSelector);
  if (content) return content;

  await ToggleSidePanel(panelType);
  return await WaitForElement(contentSelector);
}

/* ----------------------------------------------------------------------------
 * 3. Customer
 * --------------------------------------------------------------------------*/

const CUSTOMER_NAME_ID_SEPARATOR = " - ";

function ParseCustomerInfo() {
  const [nameEl, phoneEl, emailEl] = QueryAll(document, Elements.CUSTOMER_DETAIL_ITEM_CLASS);
  const companyEl = Query(document, Elements.CUSTOMER_COMPANY_CLASS);

  const [rawName = "", customerId = ""] = (GetDetailValue(nameEl) ?? "").split(CUSTOMER_NAME_ID_SEPARATOR);

  return {
    name: rawName.replaceAll("-", "").trim(),
    id: customerId.trim() || null,
    phone: GetDetailValue(phoneEl),
    email: GetDetailValue(emailEl),
    company: GetDetailValue(companyEl) ?? COMPANIES.None,
  };
}

async function EnableCommunication(enableSMS = true, enableEmail = true) {
  const cxDetailsEl = await OpenSidePanel(Elements.SIDE_BUTTIONS.Customer, Elements.CUSTOMER_DETAILS);
  if (!cxDetailsEl) return false;

  const prefCommEl = await WaitForElement(Elements.CUSTOMER_CONTACT_PREFS_CLASS, cxDetailsEl);
  const saveBtn = await WaitForElement(Elements.CUSTOMER_DETAILS_SAVE_BTN_CLASS, cxDetailsEl);
  if (!prefCommEl || !saveBtn) return false;

  const smsCheckBox = Query(prefCommEl, NameSelector(Elements.CUSTOMER_CONTACT_PREF_NAMES.Sms));
  const emailCheckBox = Query(prefCommEl, NameSelector(Elements.CUSTOMER_CONTACT_PREF_NAMES.Email));

  if (enableSMS) SetCheckbox(smsCheckBox, true);
  if (enableEmail) SetCheckbox(emailCheckBox, true);

  saveBtn.click();
  return true;
}

/* ----------------------------------------------------------------------------
 * 4. Device
 * --------------------------------------------------------------------------*/

function GetDeviceTypeWithKeywords(text) {
  const haystack = (text ?? "").toLowerCase();
  for (const value of Object.values(DEVICE_KEYWORD)) {
    if (haystack.includes(value.toLowerCase())) return value;
  }
  return "";
}

/** Reads the device row in the customer device panel. */
async function GetDeviceTypeFromDetails() {
  const deviceInfoEl = await WaitForElement(Elements.CUSTOMER_DEVICE_CLASS);
  if (!deviceInfoEl) return "";

  for (const detail of QueryAll(deviceInfoEl, Elements.DEVICE_DETAIL_ITEM_CLASS)) {
    const label = GetText(Query(detail, Elements.DETAIL_LABEL))?.toLowerCase() ?? "";
    if (label.includes(Elements.DEVICE_LABEL_KEYWORD)) {
      return GetDetailValue(detail)?.toLowerCase() ?? "";
    }
  }
  return "";
}

/** Falls back to scanning the sale item list for a device keyword. */
function GetDeviceTypeFromItems() {
  const itemList = Query(document, Elements.ITEM_LIST);
  const itemTableBody = Query(itemList, Elements.TABLE_BODY);
  if (!itemTableBody) return "";

  for (const row of QueryAll(itemTableBody, Elements.TABLE_ROW)) {
    if (row.classList.contains(Elements.ITEM_ROW_IGNORE_CLASS)) continue;

    const cells = QueryAll(row, Elements.TABLE_CELL);
    if (cells.length < Elements.ITEM_ROW_MIN_COLUMNS) continue;

    const deviceType = GetDeviceTypeWithKeywords(GetText(cells[Elements.ITEM_NAME_COLUMN_INDEX]));
    if (deviceType) return deviceType;
  }
  return "";
}

async function GetDeviceType() {
  const fromDetails = GetDeviceTypeWithKeywords(await GetDeviceTypeFromDetails());
  return fromDetails || GetDeviceTypeFromItems();
}

/* ----------------------------------------------------------------------------
 * 5. Leads & notes
 * --------------------------------------------------------------------------*/

function GetLeadMessage(deviceType, company, quote, leadStatus) {
  const companyLeads = LEAD_MESSAGE[company] ?? LEAD_MESSAGE[COMPANIES.None];

  if (!LEAD_MESSAGE[company]) {
    console.log(`Company:${company} has no valid lead messages, defaulting to no company.`);
  }

  if (company !== COMPANIES.None) {
    return leadStatus === LEAD_STATUS.NeedContact ? companyLeads[deviceType] ?? companyLeads.Default : "";
  }

  switch (leadStatus) {
    case LEAD_STATUS.NeedContact:
      return quote ? companyLeads.Quote.replace("[PRICE]", quote) : companyLeads.New;
    case LEAD_STATUS.Missed:
      return companyLeads.Missed;
    default:
      return companyLeads.Default;
  }
}

async function GetLeadStatus(noteContainer) {
  const leadStatusEl = await WaitForElement(Elements.SELECT, noteContainer);
  if (!leadStatusEl) return "";

  // Wait until an option is actually selected with valid text
  await WaitForElementChange(leadStatusEl, (el) => !!GetText(QuerySelectedOption(el)));

  return GetText(QuerySelectedOption(leadStatusEl)) ?? "";
}

function SetLeadStatus(noteContainer, statusName) {
  const selectEl = Query(noteContainer, Elements.SELECT);
  if (!selectEl) return false;

  const index = QueryOptions(selectEl).findIndex((option) => GetText(option) === statusName);
  if (index < 0) return false;

  return SetSelectedIndex(selectEl, index);
}

/** Collects everything CreateLeadNote needs, or null if the panel isn't usable. */
async function GetNoteControls(notesEl) {
  const confirmRow = await WaitForElement(Elements.NOTE_CONFRIM_ROW_CLASS, notesEl, 2000);
  const createBtn = await WaitForElement(ClassContains(Elements.CONFIRM_BTN_CLASS), confirmRow, 2000);
  if (!createBtn) {
    console.log("create note button not found");
    return null;
  }

  const commHoldEl = await WaitForElement(Elements.NOTE_COMM_BTN_HOLD_CLASS, notesEl);
  if (!commHoldEl) {
    console.log(`unable to create note, ${Elements.NOTE_COMM_BTN_HOLD_CLASS} not found`);
    return null;
  }

  const smsBtn = await WaitForElement(ClassContains(Elements.NOTE_SMS_BTN_CLASS), commHoldEl, TIMEOUTS.Short);
  const emailBtn = await WaitForElement(ClassContains(Elements.NOTE_EMAIL_BTN_CLASS), commHoldEl, TIMEOUTS.Short);

  if (!smsBtn) console.log("sms button not found");
  if (!emailBtn) console.log("email button not found");

  return { createBtn, smsBtn, emailBtn };
}

async function CreateLeadNote(deviceType, company, quote, sms = true, email = true) {
  const leadSent = { sms: false, email: false };

  const notesEl = await OpenSidePanel(Elements.SIDE_BUTTIONS.Notes, Elements.CREATE_NOTE_ID);
  if (!notesEl) {
    console.log("unable to create note, could not find elements");
    return leadSent;
  }

  const leadStatus = await GetLeadStatus(notesEl);
  const leadMessage = GetLeadMessage(deviceType, company, quote, leadStatus);

  if (!leadMessage) {
    console.log("unable to create note, no valid message");
    console.log(`status:${leadStatus}, device:${deviceType}, company:${company}`);
    return leadSent;
  }

  const controls = await GetNoteControls(notesEl);
  if (!controls) return leadSent;

  SetLeadStatus(notesEl, LEAD_STATUS.AwaitingCustomer);

  leadSent.sms = await TrySendCommunication(sms, leadMessage, controls.smsBtn, controls.createBtn, true);
  leadSent.email = await TrySendCommunication(email, leadMessage, controls.emailBtn, controls.createBtn);

  // If a quote went out, follow it with the price match message.
  if (company === COMPANIES.None && quote) {
    await WaitForButtonDisabled(controls.createBtn);
    const priceMatch = LEAD_MESSAGE[COMPANIES.None].PriceMatch;

    await TrySendCommunication(sms, priceMatch, controls.smsBtn, controls.createBtn, true);
    await TrySendCommunication(email, priceMatch, controls.emailBtn, controls.createBtn);
  }

  await ToggleSidePanel(Elements.SIDE_BUTTIONS.Notes);
  return leadSent;
}

/** Sends one message if enabled and the button exists. Returns whether it sent. */
async function TrySendCommunication(enabled, message, commBtn, createBtn, isSms = false) {
  if (!enabled || !commBtn) return false;

  await SendCommunication(message, commBtn, createBtn, isSms);
  await WaitForButtonDisabled(createBtn);
  return true;
}

async function SendCommunication(message, commBtn, createBtn, isSms = false) {
  commBtn.click();
  const composed = await SetMessageModalText(message, isSms);
  if (!composed) return false;

  return ForceClick(createBtn);
}

/**
 * Fills in and confirms the contact modal.
 * Returns false (and cancels the modal) if it can't be completed.
 */
async function SetMessageModalText(text, isSMS = false) {
  const modalEl = await WaitForElement(Elements.NOTE_CONTACT_MODAL_ID);
  if (!modalEl) return false;

  const messageArea = await WaitForElement(Elements.TEXTAREA, modalEl, TIMEOUTS.Short);
  const confirmBtn = await WaitForElement(ClassContains(Elements.CONFIRM_BTN_CLASS), modalEl, TIMEOUTS.Short);
  const cancelBtn = await WaitForElement(ClassContains(Elements.DELETE_BTN_CLASS), modalEl, TIMEOUTS.Short);

  if (!messageArea || !confirmBtn) {
    console.log("contact modal is missing its message area or confirm button");
    cancelBtn?.click();
    return false;
  }

  if (isSMS && !(await SelectPhoneNumber(modalEl))) {
    console.log("No valid phone numbers to send sms.");
    cancelBtn?.click();
    return false;
  }

  SetInputValue(messageArea, text);
  return ForceClick(confirmBtn);
}

/** Picks the first option with actual text. Returns true if a number is selected. */
async function SelectPhoneNumber(modalEl) {
  const phoneSelect = await WaitForElement(Elements.SELECT, modalEl, TIMEOUTS.Poll);
  if (!phoneSelect) return false;

  if (GetText(QuerySelectedOption(phoneSelect))) return true;

  const index = QueryOptions(phoneSelect).findIndex((option) => !!GetText(option));
  if (index < 0) return false;

  return SetSelectedIndex(phoneSelect, index);
}