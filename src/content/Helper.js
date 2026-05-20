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
  await ToggleSidePanel(ELEMENT_IDENTIFIERS.SIDE_BUTTIONS.Customer);

  let cxDetailsEl = await WaitForElement(ELEMENT_IDENTIFIERS.CUSTOMER_DETAILS);

  if (!cxDetailsEl) {
    // Try toggling again
    await ToggleSidePanel(ELEMENT_IDENTIFIERS.SIDE_BUTTIONS.Customer);
    cxDetailsEl = await WaitForElement(ELEMENT_IDENTIFIERS.CUSTOMER_DETAILS);
    if (!cxDetailsEl) return;
  }

  const prefCommEl = await WaitForElement(ELEMENT_IDENTIFIERS.CUSTOMER_CONTACT_PREFS_CLASS, cxDetailsEl);
  if (!prefCommEl) return;

  const saveBtn = await WaitForElement(ELEMENT_IDENTIFIERS.CUSTOMER_DETAILS_SAVE_BTN_CLASS, cxDetailsEl);
  if (!saveBtn) return;

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
  // ToggleSidePanel(ELEMENT_IDENTIFIERS.SIDE_BUTTIONS.Customer);
}

async function ToggleSidePanel(panelType) {
  const sidePanelEl = await WaitForElement(ELEMENT_IDENTIFIERS.SIDE_BUTTONS_PANEL);
  if (!sidePanelEl) return;

  const panelTypeValid = Object.keys(ELEMENT_IDENTIFIERS.SIDE_BUTTIONS_CLASS).includes(panelType);
  const sideBtnClass = ELEMENT_IDENTIFIERS.SIDE_BUTTIONS_CLASS[panelType];

  if (!panelTypeValid) return;

  const sideButtonEl = TryQuerySelector(sidePanelEl, sideBtnClass);

  if (sideButtonEl.Success) sideButtonEl.Element.click();
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
  let message = "";
  let companyLeads = LEAD_MESSAGE[company];

  if (!companyLeads) {
    console.log(`Company:${company} has no valid lead messages`);
    companyLeads = COMPANIES.None;
  }

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
  else if (leadStatus === LEAD_STATUS.NeedContact) {
    message = companyLeads[deviceType] ?? companyLeads.Default;
  }

  return "";
}

async function GetLeadStatus(noteContainer) {
  const leadStatusEl = await WaitForElement("select", noteContainer);
  if (!leadStatusEl) return "";

  // Wait until an option is actually selected with valid text
  await WaitForElementChange(leadStatusEl, (el) => {
    const opt = el.options[el.selectedIndex];
    return opt && opt.textContent.trim().length > 0;
  });

  const selectedOption = leadStatusEl.options[leadStatusEl.selectedIndex];
  return selectedOption?.textContent?.trim() ?? "";
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

  const leadSent = { sms: false, email: false };

  // Wait for notes panel to actually appear
  let notesEl = await WaitForElement(ELEMENT_IDENTIFIERS.CREATE_NOTE_ID);

  if (!notesEl) {
    ToggleSidePanel(ELEMENT_IDENTIFIERS.SIDE_BUTTIONS.Notes);
    notesEl = await WaitForElement(ELEMENT_IDENTIFIERS.CREATE_NOTE_ID);
    if (!notesEl) {
      console.log("unable to create note, could not find elements");
      return leadSent;
    }
  }

  const leadStatus = await GetLeadStatus(notesEl);
  const leadMessage = GetLeadMessage(deviceType, company, leadStatus);

  if (!leadMessage) {
    console.log("unable to create note, no valid message");
    console.log(`status:${leadStatus}, device:${deviceType}, company:${company}`);
    return leadSent;
  }

  const createNoteContainer = await WaitForElement(ELEMENT_IDENTIFIERS.NOTE_CONFRIM_ROW_CLASS, notesEl, 2000);
  const createNoteBtn = await WaitForElement(`[class*="${ELEMENT_IDENTIFIERS.CONFIRM_BTN_CLASS}"]`, createNoteContainer, 2000);

  // Wait for diag-hold (sms/email button container) to be ready
  const diagHoldEl = await WaitForElement(".diag-hold", notesEl);
  if (!diagHoldEl) {
    console.log("unable to create note, diag-hold not found");
    return leadSent;
  }

  if (!createNoteBtn) {
    console.log("create note button not found");
    return leadSent;
  }

  const noteSmsButton = await WaitForElement(`[class*="${ELEMENT_IDENTIFIERS.NOTE_SMS_BTN_CLASS}"]`, diagHoldEl, 1000);
  const noteEmailButton = await WaitForElement(`[class*="${ELEMENT_IDENTIFIERS.NOTE_EMAIL_BTN_CLASS}"]`, diagHoldEl, 1000);

  if (!noteSmsButton) {
    console.log(`sms button note found`);
  }
  if (!noteEmailButton) {
    console.log(`sms button note found`);
  }

  SetLeadStatus(notesEl, LEAD_STATUS.AwaitingCustomer);

  if (sms && noteSmsButton) {
    noteSmsButton.click();
    await SetMessageModalText(leadMessage);

    createNoteBtn.disabled = false;
    createNoteBtn.click();
    await WaitForElementChange(createNoteBtn, (el) => el.disabled === true);
    leadSent.sms = true;
  }

  if (email && noteEmailButton) {
    noteEmailButton.click();
    await SetMessageModalText(leadMessage);

    createNoteBtn.disabled = false;
    createNoteBtn.click();
    leadSent.email = true;
  }

  await ToggleSidePanel(ELEMENT_IDENTIFIERS.SIDE_BUTTIONS.Notes);
  return leadSent;
}

async function SetMessageModalText(text) {
  const modalEl = await WaitForElement(ELEMENT_IDENTIFIERS.NOTE_CONTACT_MODAL_ID);
  const messageArea = await WaitForElement("textarea", modalEl, 1000);
  const confirmBtn = await WaitForElement(`[class*="${ELEMENT_IDENTIFIERS.CONFIRM_BTN_CLASS}"]`, modalEl, 1000);
  messageArea.value = text;
  messageArea.dispatchEvent(new Event("input", { bubbles: true }));
  confirmBtn.disabled = false;
  confirmBtn.click();
}

function TryQuerySelector(parent, selector) {
  const element = parent?.querySelector(selector) ?? null;
  return { Success: element != null, Element: element };
}

function WaitForElement(selector, parent = document, timeout = 5000) {
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
function WaitForElementChange(element, checkFn, timeout = 5000) {
  return new Promise((resolve) => {
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

function WaitForElementRemoved(element, timeout = 5000) {
  return new Promise((resolve) => {
    if (!element || !element.isConnected) return resolve(true);

    const observer = new MutationObserver(() => {
      if (!element.isConnected) {
        observer.disconnect();
        resolve(true);
      }
    });

    const target = element.parentNode ?? document.body;
    observer.observe(target, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(false);
    }, timeout);
  });
}
