// Opening the Veritas side panel. Chrome (and Edge, Brave, Arc) use the side panel;
// Firefox uses its sidebar. Both only open in response to a click, so call this
// straight away inside the click handler, before any `await`.

type FirefoxSidebar = { sidebarAction?: { open: () => Promise<void>; toggle: () => Promise<void> } };

export function openPanel(tab: { id?: number; windowId?: number } | undefined) {
  const firefox = (browser as unknown as FirefoxSidebar).sidebarAction;
  if (firefox) return firefox.open().catch(() => {});
  if (browser.sidePanel && tab?.id != null) {
    return browser.sidePanel.open({ tabId: tab.id }).catch(() => {
      // Not counted as a click (some pages, older Chrome). The label's "Why?" button still works.
    });
  }
}

/** Clicking the toolbar icon opens the panel. Run once when the background starts. */
export function openPanelFromToolbar() {
  const firefox = (browser as unknown as FirefoxSidebar).sidebarAction;
  if (firefox) {
    browser.action.onClicked.addListener(() => void firefox.toggle());
    return;
  }
  void browser.sidePanel?.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
}
