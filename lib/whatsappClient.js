import path from "path";
import { Client, LocalAuth } from "whatsapp-web.js";

const SESSION_DIR = path.join(process.cwd(), ".wwebjs_auth");

const state = globalThis.__littlePlanetWhatsAppState || {
  client: null,
  initializing: false,
  ready: false,
  authenticated: false,
  qr: "",
  lastError: "",
  lastUpdated: null,
};

globalThis.__littlePlanetWhatsAppState = state;

function setState(nextState) {
  Object.assign(state, nextState, { lastUpdated: new Date().toISOString() });
}

function createClient() {
  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: "little-planet-school",
      dataPath: SESSION_DIR,
    }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  client.on("qr", (qr) => {
    setState({
      qr,
      ready: false,
      authenticated: false,
      lastError: "",
    });
  });

  client.on("authenticated", () => {
    setState({
      authenticated: true,
      qr: "",
      lastError: "",
    });
  });

  client.on("ready", () => {
    setState({
      ready: true,
      authenticated: true,
      qr: "",
      lastError: "",
    });
  });

  client.on("auth_failure", (message) => {
    setState({
      authenticated: false,
      ready: false,
      lastError: message || "WhatsApp authentication failed.",
    });
  });

  client.on("disconnected", (reason) => {
    setState({
      client: null,
      initializing: false,
      ready: false,
      authenticated: false,
      qr: "",
      lastError: reason || "WhatsApp disconnected.",
    });
  });

  return client;
}

export function getWhatsAppState() {
  return {
    initializing: state.initializing,
    ready: state.ready,
    authenticated: state.authenticated,
    hasQr: Boolean(state.qr),
    qr: state.qr,
    lastError: state.lastError,
    lastUpdated: state.lastUpdated,
  };
}

export async function ensureWhatsAppClient() {
  if (state.client || state.initializing) {
    return getWhatsAppState();
  }

  state.client = createClient();
  setState({ initializing: true, lastError: "" });

  state.client
    .initialize()
    .catch((error) => {
      setState({
        client: null,
        initializing: false,
        ready: false,
        authenticated: false,
        qr: "",
        lastError: error?.message || "Unable to start WhatsApp client.",
      });
    })
    .finally(() => {
      setState({ initializing: false });
    });

  return getWhatsAppState();
}

export async function resetWhatsAppClient() {
  const client = state.client;

  setState({
    client: null,
    initializing: false,
    ready: false,
    authenticated: false,
    qr: "",
    lastError: "",
  });

  if (client) {
    try {
      await client.destroy();
    } catch {
      // The browser process may already be gone; starting fresh is enough.
    }
  }

  return ensureWhatsAppClient();
}
