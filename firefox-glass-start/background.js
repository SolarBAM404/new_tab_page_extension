const extensionApi = globalThis.browser || globalThis.chrome;

function openDashboard() {
  return extensionApi.tabs.create({
    url: extensionApi.runtime.getURL("newtab.html")
  });
}

extensionApi.action.onClicked.addListener(openDashboard);

extensionApi.commands.onCommand.addListener((command) => {
  if (command !== "open-dashboard") {
    return;
  }

  openDashboard();
});
