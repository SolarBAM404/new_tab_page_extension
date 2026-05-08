function openDashboard() {
  return chrome.tabs.create({
    url: chrome.runtime.getURL("newtab.html")
  });
}

chrome.action.onClicked.addListener(openDashboard);

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "open-dashboard") {
    return;
  }

  await openDashboard();
});
