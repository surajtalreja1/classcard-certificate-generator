import type { APIRoute } from "astro";

const AIRTABLE_PAT = "patrj1EYJRXVCzBmH.0917a5b0004637e734bdd106f3db2a6e782f5ba0dc642c5fd8c26ebf29366fbd";
const AIRTABLE_BASE = "appXULTX7t6QIniJo";
const AIRTABLE_TABLE = "tblLf51K6WjXT3r1M";
const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}`;

async function sendToAirtable(fields: Record<string, string>): Promise<boolean> {
  const res = await fetch(AIRTABLE_URL, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${AIRTABLE_PAT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      records: [{ fields }],
      performUpsert: { fieldsToMergeOn: ["Email"] },
    }),
  });
  return res.ok;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    const fields: Record<string, string> = {
      Tool: "certificate-generator",
    };
    if (data.email) fields["Email"] = data.email;
    if (data.website) fields["Website"] = data.website;

    console.log("[lead-capture]", JSON.stringify(fields));

    let ok = await sendToAirtable(fields);
    if (!ok) {
      console.log("[lead-capture] Airtable failed, retrying...");
      ok = await sendToAirtable(fields);
    }
    if (!ok) {
      console.log("[lead-capture] Airtable retry failed — lead preserved in logs");
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e: any) {
    console.log("[lead-capture] Error:", e.message);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }
};
