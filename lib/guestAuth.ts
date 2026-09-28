const STORAGE_GUEST_KEY = "nisan_guest_name";
const STORAGE_GUEST_ID_KEY = "nisan_guest_id";

export async function saveAndRegisterGuest(name: string): Promise<string> {
  const cleanName = name.trim();
  if (typeof window === "undefined" || !cleanName) return "";

  let guestId = localStorage.getItem(STORAGE_GUEST_ID_KEY) || "";
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    localStorage.setItem(STORAGE_GUEST_ID_KEY, guestId);
  }

  localStorage.setItem(STORAGE_GUEST_KEY, cleanName);

  // Fire-and-forget guest registration to server/database
  try {
    fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: cleanName, guestId }),
    }).catch((err) => console.error("Guest registration background sync error:", err));
  } catch (err) {
    console.error("Guest registration error:", err);
  }

  return cleanName;
}

export function getStoredGuestInfo(): { name: string; guestId: string } {
  if (typeof window === "undefined") return { name: "", guestId: "" };
  const name = localStorage.getItem(STORAGE_GUEST_KEY) || "";
  const guestId = localStorage.getItem(STORAGE_GUEST_ID_KEY) || "";
  return { name, guestId };
}
