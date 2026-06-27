Main();

let autoCompleteInProgress = false;
let quotePrice;

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

function InjectElements() {
  const apptEl = document.querySelector(ELEMENT_IDENTIFIERS.APPOINTMENT);

  if (!apptEl) return;

  // Don't inject if already there
  if (document.querySelector(".Quick-Lead-Button")) return;
  const btn = document.createElement("button");
  btn.className = "Quick-Lead-Button";
  btn.textContent = "Auto Lead";
  btn.addEventListener("click", AutoCompleteLead);
  apptEl.insertAdjacentElement("afterend", btn);

  const company = ParseCustomerInfo().company;

  // inject quote input
  if (company === COMPANIES.None) {
    const input = document.createElement("input");
    input.className = "Quote-Input";
    input.placeholder = "Quote";
    input.addEventListener("input", (e) => (quotePrice = e.target.value.trim()));
    btn.insertAdjacentElement("afterend", input);
  }
}
async function AutoCompleteLead() {
  if (autoCompleteInProgress) return;

  autoCompleteInProgress = true;

  // wait for page initial load;
  await WaitForLoadingBar();

  console.log(`Auto complete initiated`);
  await EnableCommunication();

  const company = ParseCustomerInfo().company;
  const deviceType = await GetDeviceType();

  const leadSent = await CreateLeadNote(deviceType, company, quotePrice);
  console.log(`Auto complete finished. Sms sent:${leadSent.sms}, email sent:${leadSent.email}`);
  autoCompleteInProgress = false;
}

async function OnPageChange() {
  if (!location.href.includes("lead-management/leads/edit")) {
    return;
  }
  try {
    await WaitForElement(ELEMENT_IDENTIFIERS.APPOINTMENT);
    InjectElements();
  } catch (e) {
    console.log("Failed to find appointment element:", e);
  }
}
