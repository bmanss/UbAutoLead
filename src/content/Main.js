const STATE = {
  autoCompletElementsnProgress: false,
  quotePrice: "",
  lastUrl: location.href,
};

function Main() {
  OnPageChange();
  WatchForUrlChange();
}


function WatchForUrlChange() {
  const observer = new MutationObserver(() => {
    if (location.href === STATE.lastUrl) return;
    STATE.lastUrl = location.href;
    OnPageChange();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  return observer;
}

function IsLeadPage() {
  return location.href.includes(Elements.LEADS_URL_PATH);
}

async function OnPageChange() {
  if (!IsLeadPage()) return;

  const apptEl = await WaitForElement(Elements.APPOINTMENT);
  if (!apptEl) {
    console.log("Failed to find appointment element");
    return;
  }

  InjectElements(apptEl);
}

function InsertAfter(anchor, tagName, props = {}) {
  const element = Object.assign(document.createElement(tagName), props);
  anchor.insertAdjacentElement("afterend", element);
  return element;
}

function InjectElements(apptEl) {
  if (!apptEl) return false;

  // Don't inject if already there
  if (Query(document, Elements.QUICK_LEAD_BTN_CLASS)) return false;

  const leadBtn = InsertAfter(apptEl, "button", {
    className: Elements.QUICK_LEAD_BTN_NAME,
    textContent: "Auto Lead",
    onclick: AutoCompleteLead,
  });

  // Quote input only applies when there's no company on the lead.
  if (ParseCustomerInfo().company === COMPANIES.None) {
    InsertAfter(leadBtn, "input", {
      className: Elements.QUOTE_INPUT_NAME,
      placeholder: "Quote",
      oninput: (e) => (STATE.quotePrice = e.target.value.trim()),
    });
  }

  return true;
}

async function AutoCompleteLead() {
  if (STATE.autoCompletElementsnProgress) return;
  STATE.autoCompletElementsnProgress = true;

  try {
    await WaitForLoadingBar();
    console.log("Auto complete initiated");

    await EnableCommunication();

    const { company } = ParseCustomerInfo();
    const deviceType = await GetDeviceType();

    const leadSent = await CreateLeadNote(deviceType, company, STATE.quotePrice);
    console.log(`Auto complete finished. Sms sent:${leadSent.sms}, email sent:${leadSent.email}`);
  } catch (error) {
    console.log("Auto complete failed:", error);
  } finally {
    STATE.autoCompletElementsnProgress = false;
  }
}

Main();