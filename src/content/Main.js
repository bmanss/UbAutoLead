Main();

function Main() {
  console.log(Constants.APP_NAME);
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
  const apptEl = document.querySelector('.appointment');
  if (!apptEl) return;

  const btn = document.createElement("button");
  btn.className = "Quick-Lead-Button";
  btn.textContent = "Quick Lead";
  btn.addEventListener("click", AutoCompleteLead);
  apptEl.insertAdjacentElement("afterend", btn);
}

async function AutoCompleteLead() {
  console.log("Auto completing lead...");
  EnableCommunication();

  try {
    const toastEl = await WaitForElement("#toast-container");
    const toastMessageEl = TryQuerySelector(toastEl,`.toast-message`)
    if (toastMessageEl.Success){

      const message = toastMessageEl.Element.textContent;
      if (message == Constants.TOAST_MESSAGES.CUSTOMER_UPDATED){
        console.log("Communcations updated");
      }

    } 
    
    // do something with toastEl
  } catch (e) {
    console.log("Toast never appeared:", e);
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

function WaitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      reject("Timed out waiting for " + selector);
    }, timeout);
  });
}