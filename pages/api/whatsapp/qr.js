import QRCode from "qrcode";
import { getUserFromRequest } from "@/lib/auth";
import { canAccessPath } from "@/lib/permissions";
import {
  ensureWhatsAppClient,
  getWhatsAppState,
  resetWhatsAppClient,
} from "@/lib/whatsappClient";

async function getResponseState() {
  const state = getWhatsAppState();
  const qrImage = state.qr ? await QRCode.toDataURL(state.qr, { margin: 1, width: 320 }) : "";

  return {
    ...state,
    qr: undefined,
    qrImage,
  };
}

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const user = await getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!canAccessPath(user.role, "/qr")) {
    return res.status(403).json({ success: false, message: "You do not have access to QR connection." });
  }

  try {
    if (req.method === "POST") {
      const action = req.body?.action || "restart";

      if (action !== "restart") {
        return res.status(400).json({ success: false, message: "Unsupported action" });
      }

      await resetWhatsAppClient();
      return res.status(200).json({ success: true, data: await getResponseState() });
    }

    await ensureWhatsAppClient();
    return res.status(200).json({ success: true, data: await getResponseState() });
  } catch (error) {
    console.error("WhatsApp QR API error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Unable to load WhatsApp QR.",
    });
  }
}
