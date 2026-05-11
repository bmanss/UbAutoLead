Main();

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
  console.log(`Auto complete initiated`);
  await EnableCommunication();
  
  const company = ParseCustomerInfo().company;
  const deviceType = await GetDeviceType();

  await CreateLeadNote(deviceType, company);

  const toastEl = await WaitForElement("#toast-container");
  if (!toastEl) return;

  const toastMessageEl = TryQuerySelector(toastEl, ".toast-message");
  if (toastMessageEl.Success) {
    const message = toastMessageEl.Element.textContent;
    if (message == ELEMENT_IDENTIFIERS.TOAST_MESSAGES.CUSTOMER_UPDATED) {
      // console.log("Communications updated");
    }
  }
}
async function OnPageChange() {
  if (!location.href.includes("lead-management/leads/edit")) {
    // console.log("not on a lead page");
    return;
  }

  // console.log("Page changed:", location.href);

  try {
    await WaitForElement(".appointment");
    InjectQuickLeadButton();
  } catch (e) {
    console.log("Failed to find appointment element:", e);
  }
}
