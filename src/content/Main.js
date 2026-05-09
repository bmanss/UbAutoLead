// TODO:
//  1. try remove the TryGetElementByClass in favor of query
//  2. change element identifiers to account for query type 
//  3. Get device info ***DONE***
//  4. Add lead messages
//  5. Determine lead message based on company and device type
//  6. Send message on avail communcations
//  7. Handle invalid communication errors
//  8. Other

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
  const apptEl = document.querySelector(`.${ELEMENT_IDENTIFIERS.APPOINTMENT}`);
  if (!apptEl) return;

  const btn = document.createElement("button");
  btn.className = "Quick-Lead-Button";
  btn.textContent = "Auto Lead";
  btn.addEventListener("click", AutoCompleteLead);
  apptEl.insertAdjacentElement("afterend", btn);
}

async function AutoCompleteLead() {
  console.log("Auto completing lead...");
  EnableCommunication();
  const customerInfo = ParseCustomerInfo();
  const deviceType = await GetDeviceType();
  console.log(deviceType);
  const toastEl = await WaitForElement("#toast-container");

  if (!toastEl) {
    console.log("Toast never appeared");
    return;
  }
  const toastMessageEl = TryQuerySelector(toastEl, `.toast-message`)
  if (toastMessageEl.Success) {

    const message = toastMessageEl.Element.textContent;
    if (message == ELEMENT_IDENTIFIERS.TOAST_MESSAGES.CUSTOMER_UPDATED) {
      console.log("Communcations updated");
    }
  }
}
async function OnPageChange() {
  if (!location.href.includes("lead-management/leads/edit")) {
    console.log("not on a lead page");
    return;
  }

  console.log("Page changed:", location.href);

  try {
    await WaitForElement(".appointment");
    InjectQuickLeadButton();
  } catch (e) {
    console.log("Failed to find appointment element:", e);
  }
}