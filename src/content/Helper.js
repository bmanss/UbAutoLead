// Generates relevant data from lead page
function GenerateLeadData() {
  const customerInfoElement = TryGetFirstElementByClass("customer");
  if (customerInfoElement.Success) {
    console.log(ParseCustomerInfo(customerInfoElement.Element));
    EnableCommunication();
  }
}

function ParseCustomerInfo() {
  const [nameEl, phoneEl, emailEl] = document.getElementsByClassName("customer-detail");
  const companyEl = TryGetFirstElementByClass("company customer-detail");

  const [cxName, cxID] = nameEl?.querySelector(".details")?.textContent?.trim().split(" - ") ?? null
  return {
    name: cxName.replaceAll("-", ""),
    phone: phoneEl?.querySelector(".details")?.textContent?.trim() ?? null,
    email: emailEl?.querySelector(".details")?.textContent?.trim() ?? null,
    company: companyEl.Element.querySelector(".details")?.textContent?.trim() ?? null,
  };
}

async function EnableCommunication(enableSMS = true, enableEmail = true) {
  ToggleSidePanel(ELEMENT_IDENTIFIERS.SIDE_BUTTIONS.Customer);
  let cxDetailsEl = TryGetFirstElementByClass(ELEMENT_IDENTIFIERS.CUSTOMER_DETAILS);

  // check if customer tab already open
  if (!cxDetailsEl.Success) {
    ToggleSidePanel(ELEMENT_IDENTIFIERS.SIDE_BUTTIONS.Customer);
    cxDetailsEl = TryGetFirstElementByClass(ELEMENT_IDENTIFIERS.CUSTOMER_DETAILS);

    // if still not found exit
    if (!cxDetailsEl.Success) return;
  }

  const prefCommEl = await WaitForElement(ELEMENT_IDENTIFIERS.CUSTOMER_CONTACT_PREFS_CLASS, cxDetailsEl.Element);
  if (!prefCommEl) return;

  const saveBtn = TryQuerySelector(cxDetailsEl.Element, ELEMENT_IDENTIFIERS.CUSTOMER_DETAILS_SAVE_BTN_CLASS, true).Element;

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
  const sidePanelEl = TryGetFirstElementByClass(ELEMENT_IDENTIFIERS.SIDE_BUTTONS_PANEL);
  const panelTypeValid = Object.keys(ELEMENT_IDENTIFIERS.SIDE_BUTTIONS_CLASS).includes(panelType);
  const sideBtnClass = ELEMENT_IDENTIFIERS.SIDE_BUTTIONS_CLASS[panelType];

  if (sidePanelEl.Success && panelTypeValid) {
    const sideButtonEl = TryQuerySelector(sidePanelEl.Element, sideBtnClass, true);

    if (sideButtonEl.Success)
      sideButtonEl.Element.click();
  }
}

async function GetDeviceType() {

  let deviceType = "";
  // check device info first,
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
  
  // check if device has a type
  if (!!deviceType) return deviceType;

  // if type is still empty check items for keywords

  const itemList = document.querySelector(ELEMENT_IDENTIFIERS.ITEM_LIST);
  const itemTableBody = itemList.querySelector("tbody");

  if (!itemTableBody) return deviceType;
  
  for (const row of itemTableBody.querySelectorAll("tr")) {

    // Skip rows with animate class (item drop down row)
    if (row.classList.contains("animate-show")) continue;

    const rowData = row.querySelectorAll("td");
    if (!rowData || rowData.length < 3) continue;

    const item = rowData[2];
    const itemText = item.textContent.toLowerCase();
    
    // match device type to keywords
    deviceType = GetDeviceTypeWithKeywords(itemText);

    if (!!deviceType) return deviceType;
  }
  return deviceType;
}

function GetDeviceTypeWithKeywords(itemText) {
  for (const [key, value] of Object.entries(DEVICE_KEYWORD)) {
    if (itemText.includes(value)) {
      return value;
    }
  }
  return "";
}

function TryGetFirstElementByClass(className) {
  const matchingElements = document.getElementsByClassName(className);
  const element = matchingElements.length > 0 ? matchingElements[0] : null;
  return { Success: element != null, Element: element };
}

function TryQuerySelector(parent, selector, isClassString = false) {
  if (isClassString)
    selector = "." + selector.split(" ").join(".");

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