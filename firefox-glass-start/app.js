const STORAGE_KEY = "firefox-gx-glass-start-state-v1";
const extensionApi = globalThis.browser || globalThis.chrome || null;

const board = document.getElementById("board");
const toggleLockBtn = document.getElementById("toggle-lock-btn");
const addFolderBtn = document.getElementById("add-folder-btn");
const addFeedBtn = document.getElementById("add-feed-btn");
const exportLayoutBtn = document.getElementById("export-layout-btn");
const importLayoutBtn = document.getElementById("import-layout-btn");
const importLayoutInput = document.getElementById("import-layout-input");
const settingsBtn = document.getElementById("settings-btn");
const pageTitleEl = document.getElementById("page-title");
const clockEl = document.getElementById("clock");
const settingsPanel = document.getElementById("settings-panel");
const settingsForm = document.getElementById("settings-form");
const settingsCloseBtn = document.getElementById("settings-close-btn");
const settingsCancelBtn = document.getElementById("settings-cancel-btn");
const settingsResetBtn = document.getElementById("settings-reset-btn");
const settingsTitleInput = document.getElementById("settings-title-text");
const settingsDateFormatInput = document.getElementById("settings-date-format");
const settingsDatePatternInput = document.getElementById("settings-date-pattern");
const settingsPresetInput = document.getElementById("settings-background-preset");
const settingsAccentInput = document.getElementById("settings-accent");
const settingsBgStartInput = document.getElementById("settings-bg-start");
const settingsBgEndInput = document.getElementById("settings-bg-end");
const settingsGlowPrimaryInput = document.getElementById("settings-glow-primary");
const settingsGlowSecondaryInput = document.getElementById("settings-glow-secondary");
const settingsGlassInput = document.getElementById("settings-glass");
const settingsGlassValue = document.getElementById("settings-glass-value");
const settingsBlurInput = document.getElementById("settings-blur");
const settingsBlurValue = document.getElementById("settings-blur-value");
const settingsRadiusInput = document.getElementById("settings-radius");
const settingsRadiusValue = document.getElementById("settings-radius-value");
const settingsTextScaleInput = document.getElementById("settings-text-scale");
const settingsTextScaleValue = document.getElementById("settings-text-scale-value");
const settingsDensityInput = document.getElementById("settings-density");
const settingsTextureInput = document.getElementById("settings-texture");
const settingsAnimationsInput = document.getElementById("settings-animations");
const linkModal = document.getElementById("link-modal");
const linkForm = document.getElementById("link-form");
const linkModalTitle = document.getElementById("link-modal-title");
const linkCloseBtn = document.getElementById("link-close-btn");
const linkCancelBtn = document.getElementById("link-cancel-btn");
const linkTitleInput = document.getElementById("link-title-input");
const linkUrlInput = document.getElementById("link-url-input");
const linkIconUrlInput = document.getElementById("link-icon-url-input");
const linkModalError = document.getElementById("link-modal-error");
const feedControlsModal = document.getElementById("feed-controls-modal");
const feedControlsForm = document.getElementById("feed-controls-form");
const feedControlsTitle = document.getElementById("feed-controls-title");
const feedControlsCloseBtn = document.getElementById("feed-controls-close-btn");
const feedControlsCancelBtn = document.getElementById("feed-controls-cancel-btn");
const feedMaxItemsInput = document.getElementById("feed-max-items-input");
const feedSourceSelect = document.getElementById("feed-source-select");
const feedSourceNameInput = document.getElementById("feed-source-name-input");
const feedSourceUrlInput = document.getElementById("feed-source-url-input");
const feedControlsError = document.getElementById("feed-controls-error");
const feedDeleteSourceBtn = document.getElementById("feed-delete-source-btn");
const feedAddSourceBtn = document.getElementById("feed-add-source-btn");
const feedMoveSourceBtn = document.getElementById("feed-move-source-btn");

const folderTemplate = document.getElementById("folder-template");
const feedTemplate = document.getElementById("feed-template");

let state = null;
let dragWidgetId = null;
let dragLinkInfo = null;
let settingsBeforeOpen = null;
let linkModalContext = null;
let feedControlsContext = null;
const STATE_VERSION = 1;
const DEFAULT_TITLE = "GX Glass Start for Firefox";

const BACKGROUND_PRESETS = {
  gx: {
    accent: "#ff4657",
    backgroundColorA: "#0b0d10",
    backgroundColorB: "#161a22",
    backgroundGlowA: "#35b5ff",
    backgroundGlowB: "#ff4949"
  },
  aurora: {
    accent: "#00d3c7",
    backgroundColorA: "#061214",
    backgroundColorB: "#16322f",
    backgroundGlowA: "#00e5ff",
    backgroundGlowB: "#7cff6b"
  },
  midnight: {
    accent: "#7c8cff",
    backgroundColorA: "#070915",
    backgroundColorB: "#151d33",
    backgroundGlowA: "#637dff",
    backgroundGlowB: "#ff3f7f"
  },
  ember: {
    accent: "#ff8f45",
    backgroundColorA: "#100b08",
    backgroundColorB: "#21140f",
    backgroundGlowA: "#ff7a2f",
    backgroundGlowB: "#ffd166"
  },
  mono: {
    accent: "#d8dee9",
    backgroundColorA: "#0c0d0f",
    backgroundColorB: "#191b1f",
    backgroundGlowA: "#f6f8ff",
    backgroundGlowB: "#8a93a6"
  }
};

const DEFAULT_SETTINGS = {
  title: DEFAULT_TITLE,
  accent: "#ff4657",
  layoutLocked: false,
  dateFormat: "weekday-date-time",
  datePattern: "ddd, MMM D, HH:mm",
  backgroundPreset: "gx",
  backgroundColorA: "#0b0d10",
  backgroundColorB: "#161a22",
  backgroundGlowA: "#35b5ff",
  backgroundGlowB: "#ff4949",
  backgroundTexture: true,
  glassOpacity: 8,
  blurStrength: 16,
  cornerRadius: 16,
  density: "comfortable",
  textScale: 100,
  animations: true
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function createDefaultState() {
  const starterFolderId = uid();
  const starterFeedId = uid();

  return {
    version: STATE_VERSION,
    settings: { ...DEFAULT_SETTINGS },
    folders: [
      {
        id: starterFolderId,
        name: "Daily",
        links: [
          { id: uid(), title: "YouTube", url: "https://www.youtube.com" },
          { id: uid(), title: "GitHub", url: "https://github.com" },
          { id: uid(), title: "Gmail", url: "https://mail.google.com" }
        ]
      }
    ],
    feeds: [
      {
        id: starterFeedId,
        name: "Tech News",
        url: "https://feeds.arstechnica.com/arstechnica/index",
        maxItems: 8,
        cachedItems: [],
        lastFetchedAt: null,
        error: null
      }
    ],
    widgets: [
      { id: `folder:${starterFolderId}` },
      { id: `feed:${starterFeedId}` }
    ]
  };
}

function storageGet(key) {
  if (extensionApi?.storage?.local) {
    if (globalThis.browser?.storage?.local) {
      return globalThis.browser.storage.local.get(key).then((result) => result[key]);
    }

    return new Promise((resolve) => extensionApi.storage.local.get([key], (result) => resolve(result[key])));
  }

  const raw = localStorage.getItem(key);
  return Promise.resolve(raw ? JSON.parse(raw) : null);
}

function storageSet(key, value) {
  if (extensionApi?.storage?.local) {
    if (globalThis.browser?.storage?.local) {
      return globalThis.browser.storage.local.set({ [key]: value });
    }

    return new Promise((resolve) => extensionApi.storage.local.set({ [key]: value }, resolve));
  }

  localStorage.setItem(key, JSON.stringify(value));
  return Promise.resolve();
}

async function saveState() {
  await storageSet(STORAGE_KEY, state);
}

function padNumber(value, width = 2) {
  return String(value).padStart(width, "0");
}

function formatDatePattern(date, pattern) {
  const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daysLong = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthsLong = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  const hour24 = date.getHours();
  const hour12 = hour24 % 12 || 12;
  const tokenValues = {
    YYYY: String(date.getFullYear()),
    YY: String(date.getFullYear()).slice(-2),
    MMMM: monthsLong[date.getMonth()],
    MMM: monthsShort[date.getMonth()],
    MM: padNumber(date.getMonth() + 1),
    M: String(date.getMonth() + 1),
    DD: padNumber(date.getDate()),
    D: String(date.getDate()),
    dddd: daysLong[date.getDay()],
    ddd: daysShort[date.getDay()],
    HH: padNumber(hour24),
    H: String(hour24),
    hh: padNumber(hour12),
    h: String(hour12),
    mm: padNumber(date.getMinutes()),
    m: String(date.getMinutes()),
    ss: padNumber(date.getSeconds()),
    s: String(date.getSeconds()),
    A: hour24 >= 12 ? "PM" : "AM"
  };

  return pattern.replace(/YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|HH|H|hh|h|mm|m|ss|s|A/g, (token) => tokenValues[token]);
}

function formatClock(date, settings) {
  switch (settings.dateFormat) {
    case "date-time":
      return date.toLocaleString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    case "time-date":
      return `${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${date.toLocaleDateString([], {
        month: "short",
        day: "numeric"
      })}`;
    case "time-only":
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    case "date-only":
      return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    case "iso-date-time":
      return formatDatePattern(date, "YYYY-MM-DD HH:mm");
    case "custom":
      return formatDatePattern(date, settings.datePattern || DEFAULT_SETTINGS.datePattern);
    case "weekday-date-time":
    default:
      return date.toLocaleString([], {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        day: "numeric"
      });
  }
}

function tickClock() {
  const now = new Date();
  const settings = normalizeSettings(state?.settings || DEFAULT_SETTINGS);
  clockEl.textContent = formatClock(now, settings);
}

function normalizeHexColor(value, fallback) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized : fallback;
}

function normalizeNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, parsed));
}

function normalizeChoice(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function normalizeText(value, fallback, maxLength = 80) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized ? normalized.slice(0, maxLength) : fallback;
}

function normalizeSettings(settings = {}) {
  const presetNames = [...Object.keys(BACKGROUND_PRESETS), "custom"];

  return {
    title: normalizeText(settings.title, DEFAULT_SETTINGS.title),
    accent: normalizeHexColor(settings.accent, DEFAULT_SETTINGS.accent),
    layoutLocked: Boolean(settings.layoutLocked),
    dateFormat: normalizeChoice(
      settings.dateFormat,
      ["weekday-date-time", "date-time", "time-date", "time-only", "date-only", "iso-date-time", "custom"],
      DEFAULT_SETTINGS.dateFormat
    ),
    datePattern: normalizeText(settings.datePattern, DEFAULT_SETTINGS.datePattern),
    backgroundPreset: normalizeChoice(settings.backgroundPreset, presetNames, DEFAULT_SETTINGS.backgroundPreset),
    backgroundColorA: normalizeHexColor(settings.backgroundColorA, DEFAULT_SETTINGS.backgroundColorA),
    backgroundColorB: normalizeHexColor(settings.backgroundColorB, DEFAULT_SETTINGS.backgroundColorB),
    backgroundGlowA: normalizeHexColor(settings.backgroundGlowA, DEFAULT_SETTINGS.backgroundGlowA),
    backgroundGlowB: normalizeHexColor(settings.backgroundGlowB, DEFAULT_SETTINGS.backgroundGlowB),
    backgroundTexture: settings.backgroundTexture !== false,
    glassOpacity: normalizeNumber(settings.glassOpacity, 4, 22, DEFAULT_SETTINGS.glassOpacity),
    blurStrength: normalizeNumber(settings.blurStrength, 0, 28, DEFAULT_SETTINGS.blurStrength),
    cornerRadius: normalizeNumber(settings.cornerRadius, 8, 24, DEFAULT_SETTINGS.cornerRadius),
    density: normalizeChoice(settings.density, ["comfortable", "compact", "spacious"], DEFAULT_SETTINGS.density),
    textScale: normalizeNumber(settings.textScale, 90, 115, DEFAULT_SETTINGS.textScale),
    animations: settings.animations !== false
  };
}

function rgbaFromHex(hex, alpha) {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return `rgba(255, 255, 255, ${alpha})`;
  }
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function applyTheme() {
  state.settings = normalizeSettings(state.settings);

  const settings = state.settings;
  pageTitleEl.textContent = settings.title;
  document.title = settings.title;
  document.documentElement.style.setProperty("--accent", settings.accent);
  document.documentElement.style.setProperty("--accent-secondary", settings.backgroundGlowB);
  document.documentElement.style.setProperty("--bg-1", settings.backgroundColorA);
  document.documentElement.style.setProperty("--bg-2", settings.backgroundColorB);
  document.documentElement.style.setProperty("--bg-soft-a", rgbaFromHex(settings.backgroundColorB, 0.72));
  document.documentElement.style.setProperty("--bg-soft-b", rgbaFromHex(settings.accent, 0.18));
  document.documentElement.style.setProperty("--ambient-glow-a", rgbaFromHex(settings.backgroundGlowA, 0.16));
  document.documentElement.style.setProperty("--ambient-glow-b", rgbaFromHex(settings.backgroundGlowB, 0.2));
  document.documentElement.style.setProperty("--glass", `rgba(255, 255, 255, ${settings.glassOpacity / 100})`);
  document.documentElement.style.setProperty("--glass-border", `rgba(255, 255, 255, ${(settings.glassOpacity + 10) / 100})`);
  document.documentElement.style.setProperty("--glass-blur", `${settings.blurStrength}px`);
  document.documentElement.style.setProperty("--radius-card", `${settings.cornerRadius}px`);
  document.documentElement.style.setProperty("--radius-control", `${Math.max(8, settings.cornerRadius - 4)}px`);
  document.documentElement.style.setProperty("--text-scale", `${settings.textScale}%`);

  document.body.dataset.density = settings.density;
  document.body.classList.toggle("no-texture", !settings.backgroundTexture);
  document.body.classList.toggle("reduce-motion", !settings.animations);

  const accentHex = settings.accent;
  const rgb = hexToRgb(accentHex);
  if (rgb) {
    document.documentElement.style.setProperty("--accent-soft", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`);
  }

  tickClock();
}

function isLayoutLocked() {
  return Boolean(state?.settings?.layoutLocked);
}

function updateLockUi() {
  const locked = isLayoutLocked();

  toggleLockBtn.textContent = locked ? "🔓" : "Lock Layout";
  toggleLockBtn.setAttribute("aria-label", locked ? "Unlock layout" : "Lock layout");
  toggleLockBtn.title = locked ? "Unlock layout" : "Lock layout";
  toggleLockBtn.classList.remove("btn-accent");
  toggleLockBtn.classList.toggle("unlock-icon-btn", locked);
  document.body.classList.toggle("layout-locked", locked);

  addFolderBtn.hidden = locked;
  addFeedBtn.hidden = locked;
  exportLayoutBtn.hidden = locked;
  importLayoutBtn.hidden = locked;
  settingsBtn.hidden = locked;
}

function normalizeWidgetConfig(widget) {
  const orientation = widget?.orientation === "horizontal" ? "horizontal" : "vertical";

  return {
    id: typeof widget?.id === "string" ? widget.id : "",
    collapsed: Boolean(widget?.collapsed),
    orientation
  };
}

function getWidgetConfig(widgetId) {
  const widget = state.widgets.find((item) => item.id === widgetId);
  return normalizeWidgetConfig(widget || { id: widgetId });
}

async function updateWidgetConfig(widgetId, nextValues) {
  const widget = state.widgets.find((item) => item.id === widgetId);
  if (!widget) {
    return;
  }

  Object.assign(widget, nextValues);
  await saveState();
  render();
}

function applyWidgetView(node, widgetConfig) {
  const collapsed = Boolean(widgetConfig.collapsed);
  const orientation = widgetConfig.orientation === "horizontal" ? "horizontal" : "vertical";
  const collapseBtn = node.querySelector(".collapse-widget-btn");
  const orientBtn = node.querySelector(".orient-widget-btn");

  node.classList.toggle("is-collapsed", collapsed);
  node.classList.toggle("orientation-horizontal", orientation === "horizontal");
  node.classList.toggle("orientation-vertical", orientation === "vertical");
  node.dataset.orientation = orientation;
  node.setAttribute("aria-expanded", String(!collapsed));

  if (collapseBtn) {
    collapseBtn.textContent = collapsed ? "Expand" : "Collapse";
    collapseBtn.setAttribute("aria-label", collapsed ? "Expand section" : "Collapse section");
    collapseBtn.title = collapsed ? "Expand section" : "Collapse section";
  }

  if (orientBtn) {
    const nextOrientation = orientation === "horizontal" ? "Vertical" : "Horizontal";
    orientBtn.textContent = nextOrientation;
    orientBtn.setAttribute("aria-label", `Switch section to ${nextOrientation.toLowerCase()} layout`);
    orientBtn.title = `Switch to ${nextOrientation.toLowerCase()} layout`;
  }
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return null;
  }
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16)
  };
}

function ensureWidgetList() {
  const wanted = [];

  for (const folder of state.folders) {
    wanted.push(`folder:${folder.id}`);
  }
  for (const feed of state.feeds) {
    wanted.push(`feed:${feed.id}`);
  }

  state.widgets = Array.isArray(state.widgets) ? state.widgets.map((widget) => normalizeWidgetConfig(widget)) : [];
  const inLayout = state.widgets.map((w) => w.id);

  for (const id of wanted) {
    if (!inLayout.includes(id)) {
      state.widgets.push({ id, collapsed: false, orientation: "vertical" });
    }
  }

  state.widgets = state.widgets
    .filter((w) => wanted.includes(w.id))
    .map((widget) => ({
      ...normalizeWidgetConfig(widget),
      id: widget.id
    }));
}

function getFolder(folderId) {
  return state.folders.find((f) => f.id === folderId);
}

function getFeed(feedId) {
  return state.feeds.find((f) => f.id === feedId);
}

function createFeedSource({ id, name, url, cachedItems, lastFetchedAt, error }) {
  const sourceUrl = normalizeUrl(String(url || "").trim());
  return {
    id: id || uid(),
    name: (typeof name === "string" ? name.trim() : "") || "Source",
    url: sourceUrl,
    cachedItems: Array.isArray(cachedItems) ? cachedItems : [],
    lastFetchedAt: lastFetchedAt || null,
    error: error || null
  };
}

function normalizeFeed(feed) {
  const sourceCandidates = Array.isArray(feed?.sources) && feed.sources.length
    ? feed.sources
    : [{
        id: feed?.sourceId || uid(),
        name: feed?.sourceName || "Source",
        url: feed?.url,
        cachedItems: feed?.cachedItems,
        lastFetchedAt: feed?.lastFetchedAt,
        error: feed?.error
      }];

  const sources = sourceCandidates
    .map((source) => {
      const sourceUrl = normalizeUrl(String(source?.url || "").trim());
      if (!isValidHttpUrl(sourceUrl)) {
        return null;
      }
      return createFeedSource({
        id: source?.id,
        name: source?.name,
        url: sourceUrl,
        cachedItems: source?.cachedItems,
        lastFetchedAt: source?.lastFetchedAt,
        error: source?.error
      });
    })
    .filter((source) => source);

  const nextSources = sources;
  const activeSourceId = nextSources.some((source) => source.id === feed?.activeSourceId)
    ? feed.activeSourceId
    : nextSources[0]?.id || null;

  const aggregatedItems = nextSources
    .flatMap((source) => source.cachedItems || [])
    .slice(0, normalizeFeedMaxItems(feed?.maxItems));

  return {
    id: typeof feed?.id === "string" && feed.id.trim() ? feed.id.trim() : uid(),
    name: (typeof feed?.name === "string" ? feed.name.trim() : "") || "Feed",
    url: nextSources[0]?.url || "",
    maxItems: normalizeFeedMaxItems(feed?.maxItems),
    sources: nextSources,
    activeSourceId,
    cachedItems: aggregatedItems,
    lastFetchedAt: feed?.lastFetchedAt || null,
    error: null
  };
}

function getFeedSource(feed, sourceId) {
  return (feed.sources || []).find((source) => source.id === sourceId) || (feed.sources || [])[0] || null;
}

function getFeedBySourceUrl(url, excludeFeedId = null) {
  return state.feeds.find((feed) => {
    if (excludeFeedId && feed.id === excludeFeedId) {
      return false;
    }
    return (feed.sources || []).some((source) => source.url === url);
  });
}

function removeSourceFromFeed(feed, sourceId) {
  feed.sources = (feed.sources || []).filter((source) => source.id !== sourceId);
  if (!feed.sources.length) {
    state.feeds = state.feeds.filter((item) => item.id !== feed.id);
    ensureWidgetList();
    return;
  }

  if (!feed.sources.some((source) => source.id === feed.activeSourceId)) {
    feed.activeSourceId = feed.sources[0].id;
  }
  feed.url = feed.sources[0].url;
  ensureWidgetList();
}

function getSourcePromptLabel(source, index) {
  return `${index + 1}. ${source.name} (${source.url})`;
}

function getFaviconUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}/favicon.ico`;
  } catch {
    return "";
  }
}

function getLinkIconUrl(link) {
  return link.iconUrl || getFaviconUrl(link.url);
}

function getFallbackInitial(title, url) {
  const source = (title || url || "?").trim();
  const match = source.match(/[A-Za-z0-9]/);
  return match ? match[0].toUpperCase() : "?";
}

function setLinkModalError(message = "") {
  linkModalError.textContent = message;
}

function openLinkModal(folderId, link = null) {
  linkModalContext = {
    folderId,
    linkId: link?.id || null
  };
  linkModalTitle.textContent = link ? "Edit Link" : "New Link";
  linkTitleInput.value = link?.title || "";
  linkUrlInput.value = link?.url || "";
  linkIconUrlInput.value = link?.iconUrl || "";
  setLinkModalError();
  linkModal.hidden = false;
  linkTitleInput.focus();
}

function closeLinkModal() {
  linkModal.hidden = true;
  linkModalContext = null;
  linkForm.reset();
  setLinkModalError();
}

async function saveLinkFromModal(event) {
  event.preventDefault();

  const folder = getFolder(linkModalContext?.folderId);
  if (!folder) {
    setLinkModalError("The folder no longer exists.");
    return;
  }

  const title = linkTitleInput.value.trim();
  const normalizedUrl = normalizeUrl(linkUrlInput.value.trim());
  const rawIconUrl = linkIconUrlInput.value.trim();
  const normalizedIconUrl = rawIconUrl ? normalizeUrl(rawIconUrl) : "";

  if (!title) {
    setLinkModalError("Add a link title.");
    linkTitleInput.focus();
    return;
  }

  if (!isValidHttpUrl(normalizedUrl)) {
    setLinkModalError("Use a valid URL with http:// or https://.");
    linkUrlInput.focus();
    return;
  }

  if (normalizedIconUrl && !isValidHttpUrl(normalizedIconUrl)) {
    setLinkModalError("Use a valid icon URL with http:// or https://, or leave it blank.");
    linkIconUrlInput.focus();
    return;
  }

  const existingLink = linkModalContext.linkId
    ? folder.links.find((item) => item.id === linkModalContext.linkId)
    : null;

  if (existingLink) {
    existingLink.title = title;
    existingLink.url = normalizedUrl;
    if (normalizedIconUrl) {
      existingLink.iconUrl = normalizedIconUrl;
    } else {
      delete existingLink.iconUrl;
    }
  } else {
    folder.links.push({
      id: uid(),
      title,
      url: normalizedUrl,
      ...(normalizedIconUrl ? { iconUrl: normalizedIconUrl } : {})
    });
  }

  await saveState();
  closeLinkModal();
  render();
}

function createLinkItem(folderId, link) {
  const li = document.createElement("li");
  const locked = isLayoutLocked();
  li.className = "link-item";
  li.draggable = !locked;
  li.dataset.linkId = link.id;
  li.dataset.folderId = folderId;

  const tile = document.createElement("a");
  tile.className = "link-tile";
  tile.href = link.url;
  tile.target = "_blank";
  tile.rel = "noreferrer";
  tile.title = link.title;

  const iconWrap = document.createElement("span");
  iconWrap.className = "link-favicon-wrap";

  const favicon = document.createElement("img");
  favicon.className = "link-favicon";
  favicon.src = getLinkIconUrl(link);
  favicon.alt = "";

  const fallback = document.createElement("span");
  fallback.className = "link-fallback";
  fallback.textContent = getFallbackInitial(link.title, link.url);

  favicon.addEventListener("error", () => {
    favicon.classList.add("is-hidden");
    fallback.classList.add("is-visible");
  });

  iconWrap.append(favicon, fallback);

  const label = document.createElement("span");
  label.className = "link-label";
  label.textContent = link.title;

  tile.append(iconWrap, label);

  li.append(tile);

  if (!locked) {
    const toolWrap = document.createElement("div");
    toolWrap.className = "small-tools";

    const editBtn = document.createElement("button");
    editBtn.className = "icon-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => {
      openLinkModal(folderId, link);
    });

    const delBtn = document.createElement("button");
    delBtn.className = "icon-btn";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", async () => {
      const folder = getFolder(folderId);
      folder.links = folder.links.filter((item) => item.id !== link.id);
      await saveState();
      render();
    });

    toolWrap.append(editBtn, delBtn);
    li.append(toolWrap);
  }

  li.addEventListener("dragstart", () => {
    dragLinkInfo = { sourceFolderId: folderId, linkId: link.id };
    li.classList.add("dragging");
  });

  li.addEventListener("dragend", () => {
    li.classList.remove("dragging");
    dragLinkInfo = null;
  });

  return li;
}

function createFolderWidget(folder, widgetConfig) {
  const locked = isLayoutLocked();
  const node = folderTemplate.content.firstElementChild.cloneNode(true);
  const title = node.querySelector(".widget-title");
  const linksList = node.querySelector(".links-list");
  const dragHint = node.querySelector(".link-drag-hint");
  const collapseBtn = node.querySelector(".collapse-widget-btn");
  const orientBtn = node.querySelector(".orient-widget-btn");
  const addLinkBtn = node.querySelector(".add-link-btn");
  const renameBtn = node.querySelector(".rename-folder-btn");
  const deleteBtn = node.querySelector(".delete-folder-btn");
  const widgetId = `folder:${folder.id}`;

  title.textContent = folder.name;
  node.dataset.widgetId = widgetId;
  node.draggable = !locked;
  dragHint.hidden = locked;
  orientBtn.hidden = locked;
  addLinkBtn.hidden = locked;
  renameBtn.hidden = locked;
  deleteBtn.hidden = locked;
  applyWidgetView(node, widgetConfig);

  if (!folder.links.length) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No links yet. Add one to get started.";
    linksList.append(empty);
  }

  for (const link of folder.links) {
    linksList.append(createLinkItem(folder.id, link));
  }

  linksList.addEventListener("dragover", (event) => {
    if (locked || !dragLinkInfo) {
      return;
    }
    event.preventDefault();
  });

  linksList.addEventListener("drop", async (event) => {
    if (locked || !dragLinkInfo) {
      return;
    }
    event.preventDefault();

    const sourceFolder = getFolder(dragLinkInfo.sourceFolderId);
    const targetFolder = getFolder(folder.id);

    if (!sourceFolder || !targetFolder) {
      return;
    }

    const movingLink = sourceFolder.links.find((item) => item.id === dragLinkInfo.linkId);
    if (!movingLink) {
      return;
    }

    sourceFolder.links = sourceFolder.links.filter((item) => item.id !== dragLinkInfo.linkId);
    targetFolder.links.push(movingLink);

    await saveState();
    render();
  });

  addLinkBtn.addEventListener("click", () => {
    openLinkModal(folder.id);
  });

  collapseBtn.addEventListener("click", async () => {
    await updateWidgetConfig(widgetId, { collapsed: !widgetConfig.collapsed });
  });

  orientBtn.addEventListener("click", async () => {
    await updateWidgetConfig(widgetId, {
      orientation: widgetConfig.orientation === "horizontal" ? "vertical" : "horizontal"
    });
  });

  renameBtn.addEventListener("click", async () => {
    const nextName = prompt("Folder name:", folder.name);
    if (!nextName) {
      return;
    }
    folder.name = nextName.trim();
    await saveState();
    render();
  });

  deleteBtn.addEventListener("click", async () => {
    const confirmed = confirm(`Delete folder \"${folder.name}\"?`);
    if (!confirmed) {
      return;
    }
    state.folders = state.folders.filter((f) => f.id !== folder.id);
    ensureWidgetList();
    await saveState();
    render();
  });

  return node;
}

function createFeedWidget(feed, widgetConfig) {
  const locked = isLayoutLocked();
  const node = feedTemplate.content.firstElementChild.cloneNode(true);
  const title = node.querySelector(".widget-title");
  const tabs = node.querySelector(".feed-tabs");
  const feedList = node.querySelector(".feed-list");
  const hint = node.querySelector(".hint");
  const collapseBtn = node.querySelector(".collapse-widget-btn");
  const orientBtn = node.querySelector(".orient-widget-btn");
  const refreshBtn = node.querySelector(".refresh-feed-btn");
  const controlsBtn = node.querySelector(".feed-controls-btn");
  const renameBtn = node.querySelector(".rename-feed-btn");
  const deleteBtn = node.querySelector(".delete-feed-btn");
  const widgetId = `feed:${feed.id}`;

  node.draggable = !locked;
  orientBtn.hidden = locked;
  controlsBtn.hidden = locked;
  renameBtn.hidden = locked;
  deleteBtn.hidden = locked;
  node.dataset.widgetId = widgetId;
  title.textContent = feed.name;
  applyWidgetView(node, widgetConfig);

  const activeSource = getFeedSource(feed, feed.activeSourceId);

  tabs.innerHTML = "";
  for (const source of feed.sources || []) {
    const tabBtn = document.createElement("button");
    tabBtn.className = "feed-tab";
    tabBtn.type = "button";
    tabBtn.textContent = source.name;
    tabBtn.title = source.url;
    tabBtn.classList.toggle("is-active", source.id === activeSource?.id);
    tabBtn.addEventListener("click", async () => {
      if (feed.activeSourceId === source.id) {
        return;
      }
      feed.activeSourceId = source.id;
      await saveState();
      render();
    });
    tabs.append(tabBtn);
  }

  if (!activeSource) {
    const err = document.createElement("li");
    err.className = "empty";
    err.textContent = "No feed sources configured yet.";
    feedList.append(err);
  } else if (activeSource.error && !activeSource.cachedItems?.length) {
    const err = document.createElement("li");
    err.className = "empty";
    err.textContent = `Feed error: ${activeSource.error}`;
    feedList.append(err);
  } else if (!activeSource.cachedItems?.length) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No items loaded yet. Click Refresh.";
    feedList.append(empty);
  } else {
    for (const item of activeSource.cachedItems.slice(0, normalizeFeedMaxItems(feed.maxItems))) {
      const li = document.createElement("li");
      li.className = "feed-item";

      const sourceLabel = document.createElement("span");
      sourceLabel.className = "feed-source-label";
      sourceLabel.textContent = activeSource.name;

      const a = document.createElement("a");
      a.href = item.link;
      a.textContent = item.title || "Untitled";
      a.target = "_blank";
      a.rel = "noreferrer";

      li.append(sourceLabel, a);
      feedList.append(li);
    }
  }

  hint.textContent = feed.lastFetchedAt
    ? `Updated ${new Date(feed.lastFetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · ${(feed.sources || []).length} source${(feed.sources || []).length === 1 ? "" : "s"}`
    : "Not fetched yet.";

  refreshBtn.addEventListener("click", async () => {
    await refreshFeed(feed.id);
  });

  collapseBtn.addEventListener("click", async () => {
    await updateWidgetConfig(widgetId, { collapsed: !widgetConfig.collapsed });
  });

  orientBtn.addEventListener("click", async () => {
    await updateWidgetConfig(widgetId, {
      orientation: widgetConfig.orientation === "horizontal" ? "vertical" : "horizontal"
    });
  });

  controlsBtn.addEventListener("click", () => {
    openFeedControls(feed);
  });

  renameBtn.addEventListener("click", async () => {
    const nextName = prompt("Feed name:", feed.name);
    if (!nextName) {
      return;
    }
    feed.name = nextName.trim();
    await saveState();
    render();
  });

  deleteBtn.addEventListener("click", async () => {
    const confirmed = confirm(`Delete feed \"${feed.name}\"?`);
    if (!confirmed) {
      return;
    }
    state.feeds = state.feeds.filter((f) => f.id !== feed.id);
    ensureWidgetList();
    await saveState();
    render();
  });

  return node;
}

function attachWidgetDragHandlers(el) {
  el.addEventListener("dragstart", () => {
    if (isLayoutLocked()) {
      return;
    }
    dragWidgetId = el.dataset.widgetId;
    el.classList.add("dragging");
  });

  el.addEventListener("dragend", () => {
    dragWidgetId = null;
    el.classList.remove("dragging");
    document.querySelectorAll(".widget.drop-target").forEach((w) => w.classList.remove("drop-target"));
  });

  el.addEventListener("dragover", (event) => {
    if (isLayoutLocked() || !dragWidgetId || dragWidgetId === el.dataset.widgetId) {
      return;
    }
    event.preventDefault();
    el.classList.add("drop-target");
  });

  el.addEventListener("dragleave", () => {
    el.classList.remove("drop-target");
  });

  el.addEventListener("drop", async (event) => {
    if (isLayoutLocked() || !dragWidgetId || dragWidgetId === el.dataset.widgetId) {
      return;
    }

    event.preventDefault();
    el.classList.remove("drop-target");

    const fromIndex = state.widgets.findIndex((w) => w.id === dragWidgetId);
    const toIndex = state.widgets.findIndex((w) => w.id === el.dataset.widgetId);

    if (fromIndex === -1 || toIndex === -1) {
      return;
    }

    const [moved] = state.widgets.splice(fromIndex, 1);
    state.widgets.splice(toIndex, 0, moved);

    await saveState();
    render();
  });
}

function render() {
  applyTheme();
  updateLockUi();
  board.innerHTML = "";
  ensureWidgetList();

  for (const widget of state.widgets) {
    const [kind, id] = widget.id.split(":");
    if (kind === "folder") {
      const folder = getFolder(id);
      if (!folder) {
        continue;
      }
      const node = createFolderWidget(folder, getWidgetConfig(widget.id));
      attachWidgetDragHandlers(node);
      board.append(node);
      continue;
    }

    if (kind === "feed") {
      const feed = getFeed(id);
      if (!feed) {
        continue;
      }
      const node = createFeedWidget(feed, getWidgetConfig(widget.id));
      attachWidgetDragHandlers(node);
      board.append(node);
    }
  }
}

function normalizeUrl(url) {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  return `https://${url}`;
}

function normalizeFeedMaxItems(value) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) {
    return 8;
  }
  return Math.min(30, Math.max(1, parsed));
}

function isValidHttpUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function createShareableStateSnapshot() {
  const settings = normalizeSettings(state.settings);

  return {
    version: STATE_VERSION,
    settings: { ...settings },
    folders: state.folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      links: folder.links.map((link) => ({
        id: link.id,
        title: link.title,
        url: link.url,
        ...(link.iconUrl ? { iconUrl: link.iconUrl } : {})
      }))
    })),
    feeds: state.feeds.map((feed) => ({
      id: feed.id,
      name: feed.name,
      url: feed.url,
      maxItems: normalizeFeedMaxItems(feed.maxItems),
      activeSourceId: feed.activeSourceId || null,
      sources: (feed.sources || []).map((source) => ({
        id: source.id,
        name: source.name,
        url: source.url
      }))
    })),
    widgets: state.widgets.map((widget) => {
      const normalizedWidget = normalizeWidgetConfig(widget);
      return {
        id: normalizedWidget.id,
        collapsed: normalizedWidget.collapsed,
        orientation: normalizedWidget.orientation
      };
    })
  };
}

function createExportPayload() {
  return {
    format: "gx-glass-layout",
    version: STATE_VERSION,
    exportedAt: new Date().toISOString(),
    state: createShareableStateSnapshot()
  };
}

function sanitizeImportedState(raw) {
  const importedState = raw && typeof raw === "object" && raw.state ? raw.state : raw;
  if (!importedState || typeof importedState !== "object") {
    throw new Error("Layout file must contain a valid JSON object.");
  }

  if (importedState.version !== STATE_VERSION) {
    throw new Error(`Unsupported layout version: ${importedState.version}.`);
  }

  const settings = normalizeSettings(importedState.settings);
  if (importedState.settings?.accent && importedState.settings.accent !== settings.accent) {
    throw new Error("Invalid accent color in layout file.");
  }

  if (!Array.isArray(importedState.folders)) {
    throw new Error("Layout is missing folders.");
  }
  if (!Array.isArray(importedState.feeds)) {
    throw new Error("Layout is missing feeds.");
  }
  if (!Array.isArray(importedState.widgets)) {
    throw new Error("Layout is missing widgets.");
  }

  const folderIds = new Set();
  const linkIds = new Set();
  const feedIds = new Set();

  const folders = importedState.folders.map((folder) => {
    const id = typeof folder?.id === "string" && folder.id.trim() ? folder.id.trim() : uid();
    const nextFolderId = folderIds.has(id) ? uid() : id;
    folderIds.add(nextFolderId);

    const links = Array.isArray(folder?.links)
      ? folder.links
          .map((link) => {
            const title = (typeof link?.title === "string" ? link.title.trim() : "") || "Untitled";
            const rawUrl = typeof link?.url === "string" ? link.url.trim() : "";
            const normalizedUrl = normalizeUrl(rawUrl);
            if (!isValidHttpUrl(normalizedUrl)) {
              return null;
            }
            const rawIconUrl = typeof link?.iconUrl === "string" ? link.iconUrl.trim() : "";
            const normalizedIconUrl = rawIconUrl ? normalizeUrl(rawIconUrl) : "";
            if (normalizedIconUrl && !isValidHttpUrl(normalizedIconUrl)) {
              return null;
            }

            const rawLinkId = typeof link?.id === "string" && link.id.trim() ? link.id.trim() : uid();
            const nextLinkId = linkIds.has(rawLinkId) ? uid() : rawLinkId;
            linkIds.add(nextLinkId);

            return {
              id: nextLinkId,
              title,
              url: normalizedUrl,
              ...(normalizedIconUrl ? { iconUrl: normalizedIconUrl } : {})
            };
          })
          .filter((link) => link)
      : [];

    return {
      id: nextFolderId,
      name: (typeof folder?.name === "string" ? folder.name.trim() : "") || "Folder",
      links
    };
  });

  const feeds = importedState.feeds
    .map((feed) => {
      const rawFeedId = typeof feed?.id === "string" && feed.id.trim() ? feed.id.trim() : uid();
      const nextFeedId = feedIds.has(rawFeedId) ? uid() : rawFeedId;
      feedIds.add(nextFeedId);

      const normalizedFeed = normalizeFeed({
        ...feed,
        id: nextFeedId
      });

      const validSources = (normalizedFeed.sources || []).filter((source) => isValidHttpUrl(source.url));
      if (!validSources.length) {
        return null;
      }

      return {
        ...normalizedFeed,
        sources: validSources,
        activeSourceId: validSources.some((source) => source.id === normalizedFeed.activeSourceId)
          ? normalizedFeed.activeSourceId
          : validSources[0].id,
        url: validSources[0].url,
        cachedItems: [],
        lastFetchedAt: null,
        error: null
      };
    })
    .filter((feed) => feed);

  const widgets = importedState.widgets
    .map((widget) => normalizeWidgetConfig({
      id: typeof widget?.id === "string" ? widget.id.trim() : "",
      collapsed: widget?.collapsed,
      orientation: widget?.orientation
    }))
    .filter((widget) => /^(folder|feed):/.test(widget.id));

  return {
    version: STATE_VERSION,
    settings,
    folders,
    feeds,
    widgets
  };
}

function exportLayout() {
  try {
    const payload = createExportPayload();
    const fileText = JSON.stringify(payload, null, 2);
    const blob = new Blob([fileText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);

    anchor.href = url;
    anchor.download = `gx-glass-layout-${date}.json`;
    anchor.click();

    URL.revokeObjectURL(url);
  } catch {
    alert("Could not export layout. Please try again.");
  }
}

async function importLayout(file) {
  if (!file) {
    return;
  }

  try {
    const fileText = await file.text();
    const raw = JSON.parse(fileText);
    const nextState = sanitizeImportedState(raw);
    const linkCount = nextState.folders.reduce((sum, folder) => sum + folder.links.length, 0);
    const lockText = nextState.settings.layoutLocked ? "Locked" : "Unlocked";
    const confirmed = confirm(
      "Import preview\n\n"
      + `Folders: ${nextState.folders.length}\n`
      + `Links: ${linkCount}\n`
      + `Feeds: ${nextState.feeds.length}\n`
      + `Widgets: ${nextState.widgets.length}\n`
      + `Title: ${nextState.settings.title}\n`
      + `Accent: ${nextState.settings.accent}\n`
      + `Background: ${nextState.settings.backgroundPreset}\n`
      + `Date: ${nextState.settings.dateFormat}\n`
      + `Layout: ${lockText}\n\n`
      + "This will replace your current layout. Continue?"
    );
    if (!confirmed) {
      return;
    }

    state = nextState;
    ensureWidgetList();
    await saveState();
    render();
    alert("Layout imported successfully.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown import error.";
    alert(`Import failed: ${message}`);
  }
}

async function toggleLayoutLock() {
  state.settings.layoutLocked = !isLayoutLocked();
  await saveState();
  render();
}

async function refreshFeed(feedId) {
  const feed = getFeed(feedId);
  if (!feed) {
    return;
  }

  try {
    feed.error = null;
    for (const source of feed.sources || []) {
      source.error = null;
    }
    render();

    const feedMaxItems = normalizeFeedMaxItems(feed.maxItems);
    const results = await Promise.all(
      (feed.sources || []).map(async (source) => {
        try {
          const response = await fetch(source.url, { cache: "no-store" });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const xml = await response.text();
          const doc = new DOMParser().parseFromString(xml, "text/xml");
          const itemNodes = [...doc.querySelectorAll("item, entry")].slice(0, feedMaxItems);

          const items = itemNodes
            .map((node) => {
              const title = node.querySelector("title")?.textContent?.trim();
              const linkEl = node.querySelector("link");
              const href = linkEl?.getAttribute("href") || linkEl?.textContent?.trim();
              const dateText =
                node.querySelector("pubDate")?.textContent?.trim()
                || node.querySelector("published")?.textContent?.trim()
                || node.querySelector("updated")?.textContent?.trim()
                || "";

              return {
                title: title || "Untitled",
                link: href || source.url,
                publishedAt: Number.isNaN(Date.parse(dateText)) ? 0 : Date.parse(dateText)
              };
            })
            .filter((item) => item.link);

          return {
            sourceId: source.id,
            items,
            error: null
          };
        } catch (error) {
          return {
            sourceId: source.id,
            items: [],
            error: error instanceof Error ? error.message : "Unknown feed error"
          };
        }
      })
    );

    const nowIso = new Date().toISOString();
    let successfulSources = 0;

    for (const source of feed.sources || []) {
      const result = results.find((item) => item.sourceId === source.id);
      if (!result) {
        continue;
      }

      source.cachedItems = result.items;
      source.error = result.error;
      if (!result.error) {
        successfulSources += 1;
        source.lastFetchedAt = nowIso;
      }
    }

    const mergedItems = (feed.sources || [])
      .flatMap((source) => (source.cachedItems || []).map((item) => ({ ...item })))
      .sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0))
      .slice(0, feedMaxItems);

    feed.cachedItems = mergedItems;
    feed.lastFetchedAt = nowIso;
    feed.error = successfulSources ? null : "All sources failed to refresh.";
  } catch (error) {
    feed.error = error instanceof Error ? error.message : "Unknown feed error";
  }

  await saveState();
  render();
}

async function addFolder() {
  const name = prompt("Folder name:", "New Folder");
  if (!name) {
    return;
  }

  const folder = {
    id: uid(),
    name: name.trim(),
    links: []
  };

  state.folders.push(folder);
  ensureWidgetList();
  await saveState();
  render();
}

async function addFeed() {
  const name = prompt("Feed name:", "News Feed");
  if (!name) {
    return;
  }

  const url = prompt("Feed URL:", "https://");
  if (!url) {
    return;
  }

  const sourceNameInput = prompt("Source label (example: Product Hunt - AI):", "Main Source");
  if (!sourceNameInput) {
    return;
  }

  const normalizedUrl = normalizeUrl(url.trim());
  if (!isValidHttpUrl(normalizedUrl)) {
    alert("Use a valid feed URL with http:// or https://");
    return;
  }

  const existingFeed = getFeedBySourceUrl(normalizedUrl);
  if (existingFeed) {
    alert(
      `That source URL already exists in \"${existingFeed.name}\".\n\n`
      + "Use that card's Controls button to add a different category source instead of creating a duplicate card."
    );
    return;
  }

  const feed = {
    id: uid(),
    name: name.trim(),
    url: normalizedUrl,
    maxItems: 8,
    sources: [
      createFeedSource({
        name: sourceNameInput.trim(),
        url: normalizedUrl,
        cachedItems: [],
        lastFetchedAt: null,
        error: null
      })
    ],
    activeSourceId: null,
    cachedItems: [],
    lastFetchedAt: null,
    error: null
  };
  feed.activeSourceId = feed.sources[0].id;

  state.feeds.push(feed);
  ensureWidgetList();
  await saveState();
  render();

  await refreshFeed(feed.id);
}

function getActiveFeedControlsFeed() {
  return feedControlsContext?.feedId ? getFeed(feedControlsContext.feedId) : null;
}

function getActiveFeedControlsSource(feed) {
  if (!feedControlsContext?.sourceId) {
    return null;
  }
  return (feed.sources || []).find((source) => source.id === feedControlsContext.sourceId) || null;
}

function setFeedControlsError(message = "") {
  feedControlsError.textContent = message;
  feedMoveSourceBtn.hidden = true;
}

function renderFeedSourceSelect(feed) {
  feedSourceSelect.innerHTML = "";

  for (const source of feed.sources || []) {
    const option = document.createElement("option");
    option.value = source.id;
    option.textContent = source.name;
    feedSourceSelect.append(option);
  }

  if (!feedControlsContext.sourceId) {
    const option = document.createElement("option");
    option.value = "__new__";
    option.textContent = "New source";
    feedSourceSelect.append(option);
    feedSourceSelect.value = "__new__";
    return;
  }

  feedSourceSelect.value = feedControlsContext.sourceId;
}

function populateFeedControlsModal() {
  const feed = getActiveFeedControlsFeed();
  if (!feed) {
    closeFeedControlsModal();
    return;
  }

  const source = getActiveFeedControlsSource(feed);

  feedControlsTitle.textContent = `RSS Controls: ${feed.name}`;
  feedMaxItemsInput.value = String(normalizeFeedMaxItems(feed.maxItems));
  renderFeedSourceSelect(feed);

  if (source) {
    feedSourceNameInput.value = source.name;
    feedSourceUrlInput.value = source.url;
  } else {
    feedSourceNameInput.value = `Source ${(feed.sources || []).length + 1}`;
    feedSourceUrlInput.value = "https://";
  }

  feedDeleteSourceBtn.disabled = !source || (feed.sources || []).length <= 1;
  setFeedControlsError();
}

function openFeedControls(feed) {
  const activeSource = getFeedSource(feed, feed.activeSourceId);
  feedControlsContext = {
    feedId: feed.id,
    sourceId: activeSource?.id || null
  };
  populateFeedControlsModal();
  feedControlsModal.hidden = false;
  feedSourceNameInput.focus();
}

function closeFeedControlsModal() {
  feedControlsModal.hidden = true;
  feedControlsContext = null;
  feedControlsForm.reset();
  setFeedControlsError();
}

function startNewFeedSource() {
  if (!feedControlsContext) {
    return;
  }

  feedControlsContext.sourceId = null;
  populateFeedControlsModal();
  feedSourceNameInput.focus();
}

function selectFeedSource() {
  if (!feedControlsContext) {
    return;
  }

  feedControlsContext.sourceId = feedSourceSelect.value === "__new__" ? null : feedSourceSelect.value;
  populateFeedControlsModal();
}

async function deleteSelectedFeedSource() {
  const feed = getActiveFeedControlsFeed();
  const source = feed ? getActiveFeedControlsSource(feed) : null;

  if (!feed || !source) {
    setFeedControlsError("Choose a source to delete.");
    return;
  }

  if ((feed.sources || []).length <= 1) {
    setFeedControlsError("A feed card must have at least one source.");
    return;
  }

  removeSourceFromFeed(feed, source.id);
  feedControlsContext.sourceId = feed.sources[0]?.id || null;
  await saveState();
  render();
  populateFeedControlsModal();
}

async function saveFeedControlsFromModal(allowMove = false) {
  const feed = getActiveFeedControlsFeed();
  if (!feed) {
    setFeedControlsError("The feed no longer exists.");
    return;
  }

  const source = getActiveFeedControlsSource(feed);
  const sourceName = feedSourceNameInput.value.trim() || "Source";
  const normalizedUrl = normalizeUrl(feedSourceUrlInput.value.trim());

  if (!isValidHttpUrl(normalizedUrl)) {
    setFeedControlsError("Use a valid feed URL with http:// or https://.");
    feedSourceUrlInput.focus();
    return;
  }

  const duplicateInThisFeed = (feed.sources || []).find((item) => {
    if (source && item.id === source.id) {
      return false;
    }
    return item.url === normalizedUrl;
  });
  if (duplicateInThisFeed) {
    setFeedControlsError("That source URL already exists in this card.");
    return;
  }

  const duplicateInOtherFeed = getFeedBySourceUrl(normalizedUrl, feed.id);
  if (duplicateInOtherFeed && !allowMove) {
    feedMoveSourceBtn.hidden = false;
    feedControlsError.textContent = `That source already exists in "${duplicateInOtherFeed.name}".`;
    return;
  }

  if (duplicateInOtherFeed && allowMove) {
    const duplicateSource = (duplicateInOtherFeed.sources || []).find((item) => item.url === normalizedUrl);
    if (duplicateSource) {
      removeSourceFromFeed(duplicateInOtherFeed, duplicateSource.id);
    }
  }

  feed.maxItems = normalizeFeedMaxItems(feedMaxItemsInput.value);

  if (source) {
    source.name = sourceName;
    source.url = normalizedUrl;
    feed.activeSourceId = source.id;
  } else {
    const newSource = createFeedSource({
      name: sourceName,
      url: normalizedUrl,
      cachedItems: [],
      lastFetchedAt: null,
      error: null
    });
    feed.sources.push(newSource);
    feed.activeSourceId = newSource.id;
  }

  feed.url = feed.sources[0]?.url || normalizedUrl;
  feed.error = null;
  ensureWidgetList();
  await saveState();
  closeFeedControlsModal();
  render();
  await refreshFeed(feed.id);
}

async function submitFeedControls(event) {
  event.preventDefault();
  await saveFeedControlsFromModal(false);
}

function updateSettingsRangeLabels() {
  settingsGlassValue.textContent = `${settingsGlassInput.value}%`;
  settingsBlurValue.textContent = `${settingsBlurInput.value}px`;
  settingsRadiusValue.textContent = `${settingsRadiusInput.value}px`;
  settingsTextScaleValue.textContent = `${settingsTextScaleInput.value}%`;
}

function populateSettingsForm(settings) {
  const normalized = normalizeSettings(settings);

  settingsTitleInput.value = normalized.title;
  settingsDateFormatInput.value = normalized.dateFormat;
  settingsDatePatternInput.value = normalized.datePattern;
  settingsPresetInput.value = normalized.backgroundPreset;
  settingsAccentInput.value = normalized.accent;
  settingsBgStartInput.value = normalized.backgroundColorA;
  settingsBgEndInput.value = normalized.backgroundColorB;
  settingsGlowPrimaryInput.value = normalized.backgroundGlowA;
  settingsGlowSecondaryInput.value = normalized.backgroundGlowB;
  settingsGlassInput.value = String(normalized.glassOpacity);
  settingsBlurInput.value = String(normalized.blurStrength);
  settingsRadiusInput.value = String(normalized.cornerRadius);
  settingsTextScaleInput.value = String(normalized.textScale);
  settingsDensityInput.value = normalized.density;
  settingsTextureInput.checked = normalized.backgroundTexture;
  settingsAnimationsInput.checked = normalized.animations;
  updateSettingsRangeLabels();
}

function readSettingsForm() {
  return normalizeSettings({
    title: settingsTitleInput.value,
    accent: settingsAccentInput.value,
    layoutLocked: isLayoutLocked(),
    dateFormat: settingsDateFormatInput.value,
    datePattern: settingsDatePatternInput.value,
    backgroundPreset: settingsPresetInput.value,
    backgroundColorA: settingsBgStartInput.value,
    backgroundColorB: settingsBgEndInput.value,
    backgroundGlowA: settingsGlowPrimaryInput.value,
    backgroundGlowB: settingsGlowSecondaryInput.value,
    backgroundTexture: settingsTextureInput.checked,
    glassOpacity: settingsGlassInput.value,
    blurStrength: settingsBlurInput.value,
    cornerRadius: settingsRadiusInput.value,
    density: settingsDensityInput.value,
    textScale: settingsTextScaleInput.value,
    animations: settingsAnimationsInput.checked
  });
}

function applySelectedPreset() {
  const preset = BACKGROUND_PRESETS[settingsPresetInput.value];
  if (!preset) {
    return;
  }

  settingsAccentInput.value = preset.accent;
  settingsBgStartInput.value = preset.backgroundColorA;
  settingsBgEndInput.value = preset.backgroundColorB;
  settingsGlowPrimaryInput.value = preset.backgroundGlowA;
  settingsGlowSecondaryInput.value = preset.backgroundGlowB;
}

function markSettingsAsCustom(event) {
  const colorInputs = [
    settingsAccentInput,
    settingsBgStartInput,
    settingsBgEndInput,
    settingsGlowPrimaryInput,
    settingsGlowSecondaryInput
  ];

  if (colorInputs.includes(event.target)) {
    settingsPresetInput.value = "custom";
  }
}

function previewSettings(event) {
  if (event?.target === settingsPresetInput) {
    applySelectedPreset();
  } else if (event) {
    markSettingsAsCustom(event);
  }

  updateSettingsRangeLabels();
  state.settings = readSettingsForm();
  applyTheme();
}

function closeSettingsPanel({ restore = false } = {}) {
  if (restore && settingsBeforeOpen) {
    state.settings = settingsBeforeOpen;
    applyTheme();
  }

  settingsPanel.hidden = true;
  settingsBeforeOpen = null;
}

function openSettings() {
  settingsBeforeOpen = { ...normalizeSettings(state.settings) };
  populateSettingsForm(state.settings);
  settingsPanel.hidden = false;
  settingsPresetInput.focus();
}

async function saveSettings(event) {
  event.preventDefault();
  state.settings = readSettingsForm();
  await saveState();
  render();
  closeSettingsPanel();
}

function resetSettingsForm() {
  const resetSettings = {
    ...DEFAULT_SETTINGS,
    layoutLocked: isLayoutLocked()
  };

  populateSettingsForm(resetSettings);
  state.settings = resetSettings;
  applyTheme();
}

async function init() {
  tickClock();
  setInterval(tickClock, 1000);

  const saved = await storageGet(STORAGE_KEY);
  state = saved || createDefaultState();
  state.settings = normalizeSettings(state.settings);
  state.feeds = (state.feeds || []).map((feed) => normalizeFeed(feed));
  ensureWidgetList();
  applyTheme();
  render();

  toggleLockBtn.addEventListener("click", toggleLayoutLock);
  addFolderBtn.addEventListener("click", addFolder);
  addFeedBtn.addEventListener("click", addFeed);
  exportLayoutBtn.addEventListener("click", exportLayout);
  importLayoutBtn.addEventListener("click", () => {
    importLayoutInput.click();
  });
  importLayoutInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    await importLayout(file);
    event.target.value = "";
  });
  settingsBtn.addEventListener("click", openSettings);
  settingsForm.addEventListener("submit", saveSettings);
  settingsForm.addEventListener("input", previewSettings);
  settingsForm.addEventListener("change", previewSettings);
  settingsResetBtn.addEventListener("click", resetSettingsForm);
  settingsCancelBtn.addEventListener("click", () => closeSettingsPanel({ restore: true }));
  settingsCloseBtn.addEventListener("click", () => closeSettingsPanel({ restore: true }));
  settingsPanel.addEventListener("click", (event) => {
    if (event.target === settingsPanel) {
      closeSettingsPanel({ restore: true });
    }
  });
  linkForm.addEventListener("submit", saveLinkFromModal);
  linkCloseBtn.addEventListener("click", closeLinkModal);
  linkCancelBtn.addEventListener("click", closeLinkModal);
  linkModal.addEventListener("click", (event) => {
    if (event.target === linkModal) {
      closeLinkModal();
    }
  });
  feedControlsForm.addEventListener("submit", submitFeedControls);
  feedControlsCloseBtn.addEventListener("click", closeFeedControlsModal);
  feedControlsCancelBtn.addEventListener("click", closeFeedControlsModal);
  feedAddSourceBtn.addEventListener("click", startNewFeedSource);
  feedSourceSelect.addEventListener("change", selectFeedSource);
  feedDeleteSourceBtn.addEventListener("click", deleteSelectedFeedSource);
  feedMoveSourceBtn.addEventListener("click", async () => {
    await saveFeedControlsFromModal(true);
  });
  feedControlsModal.addEventListener("click", (event) => {
    if (event.target === feedControlsModal) {
      closeFeedControlsModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !settingsPanel.hidden) {
      closeSettingsPanel({ restore: true });
      return;
    }
    if (event.key === "Escape" && !linkModal.hidden) {
      closeLinkModal();
      return;
    }
    if (event.key === "Escape" && !feedControlsModal.hidden) {
      closeFeedControlsModal();
    }
  });

  for (const feed of state.feeds) {
    if (!feed.cachedItems?.length) {
      refreshFeed(feed.id);
    }
  }
}

init();
