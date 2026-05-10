function GenerateLeadData() {
  const customerInfoElement = TryQuerySelector(document, ".customer");
  if (customerInfoElement.Success) {
    console.log(ParseCustomerInfo(customerInfoElement.Element));
    EnableCommunication();
  }
}

function ParseCustomerInfo() {
  const [nameEl, phoneEl, emailEl] = document.getElementsByClassName("customer-detail");
  const companyEl = TryQuerySelector(document, ".company.customer-detail");

  const [cxName, cxID] = nameEl?.querySelector(".details")?.textContent?.trim().split(" - ") ?? null;
  return {
    name: cxName.replaceAll("-", ""),
    phone: phoneEl?.querySelector(".details")?.textContent?.trim() ?? null,
    email: emailEl?.querySelector(".details")?.textContent?.trim() ?? null,
    company: companyEl.Element?.querySelector(".details")?.textContent?.trim() ?? COMPANIES.None,
  };
}

async function EnableCommunication(enableSMS = true, enableEmail = true) {
  ToggleSidePanel(ELEMENT_IDENTIFIERS.SIDE_BUTTIONS.Customer);
  let cxDetailsEl = TryQuerySelector(document, ELEMENT_IDENTIFIERS.CUSTOMER_DETAILS);

  if (!cxDetailsEl.Success) {
    ToggleSidePanel(ELEMENT_IDENTIFIERS.SIDE_BUTTIONS.Customer);
    cxDetailsEl = TryQuerySelector(document, ELEMENT_IDENTIFIERS.CUSTOMER_DETAILS);
    if (!cxDetailsEl.Success) return;
  }

  const prefCommEl = await WaitForElement(ELEMENT_IDENTIFIERS.CUSTOMER_CONTACT_PREFS_CLASS, cxDetailsEl.Element);
  if (!prefCommEl) return;

  const saveBtn = TryQuerySelector(cxDetailsEl.Element, ELEMENT_IDENTIFIERS.CUSTOMER_DETAILS_SAVE_BTN_CLASS).Element;

  const smsCheckBox = TryQuerySelector(prefCommEl, `[name="${ELEMENT_IDENTIFIERS.CUSTOMER_CONTACT_PREF_NAMES.Sms}"]`);
  const emailCheckBox = TryQuerySelector(prefCommEl, `[name="${ELEMENT_IDENTIFIERS.CUSTOMER_CONTACT_PREF_NAMES.Email}"]`);

  if (enableSMS && smsCheckBox.Success) {
    smsCheckBox.Element.checked = 1;
    smsCheckBox.Element.dispatchEvent(new Event("change"));
  }

  if (enableEmail && emailCheckBox.Success) {
    emailCheckBox.Element.checked = 1;
    emailCheckBox.Element.dispatchEvent(new Event("change"));
  }

  saveBtn.click();
  ToggleSidePanel(ELEMENT_IDENTIFIERS.SIDE_BUTTIONS.Customer);
}

function ToggleSidePanel(panelType) {
  const sidePanelEl = TryQuerySelector(document, ELEMENT_IDENTIFIERS.SIDE_BUTTONS_PANEL);
  const panelTypeValid = Object.keys(ELEMENT_IDENTIFIERS.SIDE_BUTTIONS_CLASS).includes(panelType);
  const sideBtnClass = ELEMENT_IDENTIFIERS.SIDE_BUTTIONS_CLASS[panelType];

  if (sidePanelEl.Success && panelTypeValid) {
    const sideButtonEl = TryQuerySelector(sidePanelEl.Element, sideBtnClass);

    if (sideButtonEl.Success) sideButtonEl.Element.click();
  }
}

async function GetDeviceType() {
  let deviceType = "";

  const deviceInfoEl = await WaitForElement(ELEMENT_IDENTIFIERS.CUSTOMER_DEVICE_CLASS);
  if (!deviceInfoEl) return "";

  const deviceDetails = deviceInfoEl.querySelectorAll(ELEMENT_IDENTIFIERS.DEVICE_DETAIL_ITEM_CLASS);

  for (const detail of deviceDetails) {
    const label = detail.querySelector("label")?.textContent?.trim();
    if (label.toLowerCase().includes("device")) {
      deviceType = detail.querySelector(".details")?.textContent?.trim()?.toLowerCase() ?? "";
      break;
    }
  }

  deviceType = GetDeviceTypeWithKeywords(deviceType);

  if (!!deviceType) return deviceType;

  const itemList = document.querySelector(ELEMENT_IDENTIFIERS.ITEM_LIST);
  const itemTableBody = itemList.querySelector("tbody");

  if (!itemTableBody) return deviceType;

  for (const row of itemTableBody.querySelectorAll("tr")) {
    if (row.classList.contains("animate-show")) continue;

    const rowData = row.querySelectorAll("td");
    if (!rowData || rowData.length < 3) continue;

    const item = rowData[2];
    const itemText = item.textContent.toLowerCase();

    deviceType = GetDeviceTypeWithKeywords(itemText);

    if (!!deviceType) return deviceType;
  }
  return deviceType;
}

function GetDeviceTypeWithKeywords(itemText) {
  for (const [key, value] of Object.entries(DEVICE_KEYWORD)) {
    if (itemText.includes(value.toLowerCase())) {
      return value;
    }
  }
  return "";
}
function GetLeadMessage(deviceType, company, leadStatus) {
  const companyLeads = LEAD_MESSAGE[company];
  if (!companyLeads) return "";

  let message = "";

  // unknown company
  if (company === COMPANIES.None) {
    switch (leadStatus) {
      case LEAD_STATUS.NeedContact:
        message = companyLeads.New;
        break;
      case LEAD_STATUS.Missed:
        message = companyLeads.Missed;
        break;
      default:
        message = companyLeads.Default;
        break;
    }
  }
  // known company lead awaiting contact
  else if (leadStatus == LEAD_STATUS.NeedContact) {
    message = companyLeads[deviceType] ?? companyLeads.Default;
  }

  return message;
}

function GetLeadStatus(noteContainer) {
  const leadStatusEl = noteContainer.querySelector("select");
  if (!leadStatusEl) return "";

  const selectedOption = leadStatusEl.options[leadStatusEl.selectedIndex];
  const statusText = selectedOption?.textContent?.trim() ?? "";

  return statusText;
}
function SetLeadStatus(noteContainer, statusName) {
  const selectEl = noteContainer.querySelector("select");
  if (!selectEl) return false;

  for (const option of selectEl.options) {
    if (option.textContent.trim() === statusName) {
      selectEl.value = option.value;
      selectEl.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }
  }
  return false;
}
async function CreateLeadNote(deviceType, company, sms = true, email = true) {
  ToggleSidePanel(ELEMENT_IDENTIFIERS.SIDE_BUTTIONS.Notes);
  let notesEl = TryQuerySelector(document, ELEMENT_IDENTIFIERS.CREATE_NOTE_ID);

  if (!notesEl.Success) {
    ToggleSidePanel(ELEMENT_IDENTIFIERS.SIDE_BUTTIONS.Notes);
    notesEl = TryQuerySelector(document, ELEMENT_IDENTIFIERS.CREATE_NOTE_ID);
    if (!notesEl.Success) return;
  }

  const leadStatus = GetLeadStatus(notesEl.Element);
  const leadMessage = GetLeadMessage(deviceType, company, leadStatus);

  const createNoteContainer = notesEl.Element.querySelector(ELEMENT_IDENTIFIERS.NOTE_CONFRIM_ROW_CLASS);
  const createNoteBtn = createNoteContainer.querySelector(`[class*="${ELEMENT_IDENTIFIERS.CONFIRM_BTN_CLASS}"]`);

  const noteSmsButton = notesEl.Element.querySelector(`[class*="${ELEMENT_IDENTIFIERS.NOTE_SMS_BTN_CLASS}"]`);
  const noteEmailButton = notesEl.Element.querySelector(`[class*="${ELEMENT_IDENTIFIERS.NOTE_EMAIL_BTN_CLASS}"]`);
  const noteEditableArea = notesEl.Element.querySelector(`[class*="${ELEMENT_IDENTIFIERS.NOTE_TEXTAREA}"]`);

  // only send valid leads message
  if (!leadMessage) return;

  SetLeadStatus(notesEl.Element, LEAD_STATUS.AwaitingCustomer);

  if (sms && noteSmsButton) {
    noteSmsButton.click();
    await SetMessageModalText(leadMessage);

    createNoteBtn.disabled = false;
    createNoteBtn.click();

    // wait for create note button to disable to make sure the note sent
    await WaitForElementChange(createNoteBtn, (el) => el.disabled === true);
  }

  if (email && noteEmailButton) {
    noteEmailButton.click();
    await SetMessageModalText(leadMessage);

    createNoteBtn.disabled = false;
    createNoteBtn.click();
  }

  ToggleSidePanel(ELEMENT_IDENTIFIERS.SIDE_BUTTIONS.Notes);
}

async function SetMessageModalText(text) {
  const modalEl = await WaitForElement(ELEMENT_IDENTIFIERS.NOTE_CONTACT_MODAL_ID);
  const messageArea = modalEl.querySelector("textarea");
  const confirmBtn = modalEl.querySelector(`[class*="${ELEMENT_IDENTIFIERS.CONFIRM_BTN_CLASS}"]`);
  messageArea.value = text;
  messageArea.dispatchEvent(new Event("input", { bubbles: true }));
  confirmBtn.click();
}

function TryQuerySelector(parent, selector) {
  const element = parent?.querySelector(selector) ?? null;
  return { Success: element != null, Element: element };
}

function WaitForElement(selector, parent = document, timeout = 10000) {
  return new Promise((resolve) => {
    const el = parent.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const el = parent.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(parent === document ? document.body : parent, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}
function WaitForElementChange(element, checkFn, timeout = 10000) {
  return new Promise((resolve) => {
    // Check immediately
    if (checkFn(element)) return resolve(element);

    const observer = new MutationObserver(() => {
      if (checkFn(element)) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(element, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

function WaitForElementRemoved(selector, parent = document, timeout = 10000) {
  return new Promise((resolve) => {
    // Already gone
    if (!parent.querySelector(selector)) return resolve(true);

    const observer = new MutationObserver(() => {
      if (!parent.querySelector(selector)) {
        observer.disconnect();
        resolve(true);
      }
    });

    observer.observe(parent === document ? document.body : parent, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(false);
    }, timeout);
  });
}
