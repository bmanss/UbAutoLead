// Generates relevant data from lead page
function GenerateLeadData(){
    const customerInfoElement = TryGetElementByClass("customer");
    if (customerInfoElement.Success){
        console.log(ParseCustomerInfo(customerInfoElement.Element));
        EnableCommunication();
    }
}

function ParseCustomerInfo() {
  const [nameEl, phoneEl, emailEl] = document.getElementsByClassName("customer-detail");
  const companyEl = TryGetElementByClass("company customer-detail");

  const [cxName, cxID] =  nameEl?.querySelector(".details")?.textContent?.trim().split(" - ") ?? null
  return {
    name: cxName.replaceAll("-",""),
    phone: phoneEl?.querySelector(".details")?.textContent?.trim() ?? null,
    email: emailEl?.querySelector(".details")?.textContent?.trim() ?? null,
    company: companyEl.Element.querySelector(".details")?.textContent?.trim() ?? null,
  };
}

function EnableCommunication(enableSMS = true, enableEmail = true) {
  ToggleSidePanel(Constants.SIDE_BUTTIONS.Customer);

  const cxDetailsEl = TryGetElementByClass(Constants.CUSTOMER_DETAILS);
  if (!cxDetailsEl.Success) return;

  const commEl = TryQuerySelector(cxDetailsEl.Element, Constants.CUSTOMER_CONTACT_PREFS_CLASS, true);
  if (!commEl.Success) return;

  const saveBtn = TryQuerySelector(cxDetailsEl.Element, Constants.CUSTOMER_DETAILS_SAVE_BTN_CLASS, true).Element;

  const smsCheckBox = TryQuerySelector(commEl.Element,`[name="${Constants.CUSTOMER_CONTACT_PREF_NAMES.Sms}"]`);
  const emailCheckBox = TryQuerySelector(commEl.Element,`[name="${Constants.CUSTOMER_CONTACT_PREF_NAMES.Email}"]`);
  
  if (enableSMS && smsCheckBox.Success){
    smsCheckBox.Element.checked = 1;
    smsCheckBox.Element.dispatchEvent(new Event("change"));
  }
    
  if (enableEmail && emailCheckBox.Success){
    emailCheckBox.Element.checked = 1;
    emailCheckBox.Element.dispatchEvent(new Event("change"));
  }

  saveBtn.click();
  ToggleSidePanel(Constants.SIDE_BUTTIONS.Customer);
}

function ToggleSidePanel(panelType) {
  const sidePanelEl = TryGetElementByClass(Constants.SIDE_BUTTONS_PANEL);
  const panelTypeValid = Object.keys(Constants.SIDE_BUTTIONS_CLASS).includes(panelType);
  const sideBtnClass = Constants.SIDE_BUTTIONS_CLASS[panelType];

  if (sidePanelEl.Success && panelTypeValid) {
    const sideButtonEl = TryQuerySelector(sidePanelEl.Element, sideBtnClass, true);

    if (sideButtonEl.Success)
      sideButtonEl.Element.click();
  }
}

function TryGetElementByClass(className) {
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