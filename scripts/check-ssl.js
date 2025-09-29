
// Node 20+. Checks TLS cert expiry for given hosts and writes ssl-results.json at repo root.
import fs from "fs";
import tls from "tls";

const targets = [
  // Replace with the exact hostnames you monitor (use the exact host users visit)
  "example.com",
  "www.example.com",
];

function getCert(host) {
  return new Promise((resolve) => {
    const socket = tls.connect(
      { host, port: 443, servername: host, rejectUnauthorized: false, timeout: 10000 },
      () => {
        const cert = socket.getPeerCertificate(true);
        socket.end();
        const validToISO = cert?.valid_to ? new Date(cert.valid_to + " UTC").toISOString() : null;
        resolve({
          host,
          ok: !!cert,
          validFrom: cert?.valid_from || null,
          validTo: cert?.valid_to || null,   // GMT string
          validToISO,                        // ISO 8601 UTC
          issuer: cert?.issuer || null,
          subject: cert?.subject || null,
          altNames: cert?.subjectaltname || null,
          checkedAt: new Date().toISOString(),
        });
      }
    );
    socket.on("error", (e) =>
      resolve({ host, ok: false, error: e.message, checkedAt: new Date().toISOString() })
    );
    socket.on("timeout", () =>
      resolve({ host, ok: false, error: "timeout", checkedAt: new Date().toISOString() })
    );
  });
}

const results = [];
for (const host of targets) {
  // eslint-disable-next-line no-await-in-loop
  results.push(await getCert(host));
}

// Write to repo root so it’s served at /monitoring/ssl-results.json
fs.writeFileSync("ssl-results.json", JSON.stringify(results, null, 2));
console.log("Wrote ssl-results.json");
