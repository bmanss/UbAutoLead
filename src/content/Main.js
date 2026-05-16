Main();

let autoCompleteInProgress = false;

function Main() {
  let lastUrl = location.href;

  // Run on initial load
  OnPageChange();

  // Watch for URL changes
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      OnPageChange();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function InjectQuickLeadButton() {
  const apptEl = document.querySelector(ELEMENT_IDENTIFIERS.APPOINTMENT);
  if (!apptEl) return;

  // Don't inject if already there
  if (document.querySelector(".Quick-Lead-Button")) return;

  const btn = document.createElement("button");
  btn.className = "Quick-Lead-Button";
  btn.textContent = "Auto Lead";
  btn.addEventListener("click", AutoCompleteLead);
  apptEl.insertAdjacentElement("afterend", btn);
}
async function AutoCompleteLead() {
  if (autoCompleteInProgress) return;

  autoCompleteInProgress = true;
  
  // wait for page initial load;
  const loadingBar = await WaitForElement(ELEMENT_IDENTIFIERS.LOADING_BAR, document, 250);

  if (loadingBar) {
    console.log("Waiting for initial load");
    await WaitForElementRemoved(loadingBar);
  }

  console.log(`Auto complete initiated`);
  await EnableCommunication();

  const company = ParseCustomerInfo().company;
  const deviceType = await GetDeviceType();

  const leadSent = await CreateLeadNote(deviceType, company);
  console.log(`Auto complete finished. Sms sent:${leadSent.sms}, email sent:${leadSent.email}`);
  autoCompleteInProgress = false;
}
async function OnPageChange() {
  if (!location.href.includes("lead-management/leads/edit")) {
    return;
  }
  try {
    await WaitForElement(ELEMENT_IDENTIFIERS.APPOINTMENT);
    InjectQuickLeadButton();
  } catch (e) {
    console.log("Failed to find appointment element:", e);
  }
}
