import { mkdir, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, "..", "public", "skins");

const skins = {
  noob:    "https://cdn.poehali.dev/projects/8908f6bc-a84f-4d41-836a-c95d7da5738b/files/c098cb11-81b3-4ccb-b9b5-92c1ae9caf1f.jpg",
  alien:   "https://cdn.poehali.dev/projects/8908f6bc-a84f-4d41-836a-c95d7da5738b/files/061eabb6-897b-4a73-8c54-00c822ed9e14.jpg",
  ninja:   "https://cdn.poehali.dev/projects/8908f6bc-a84f-4d41-836a-c95d7da5738b/files/afc07325-9767-484f-a606-d5896bdf9017.jpg",
  cowboy:  "https://cdn.poehali.dev/projects/8908f6bc-a84f-4d41-836a-c95d7da5738b/files/0b2485af-83a3-4f20-b0c8-89e5e830957f.jpg",
  pirate:  "https://cdn.poehali.dev/projects/8908f6bc-a84f-4d41-836a-c95d7da5738b/files/f6eb7b0e-130b-475e-98e3-e836f8065b86.jpg",
  vip:     "https://cdn.poehali.dev/projects/8908f6bc-a84f-4d41-836a-c95d7da5738b/files/0f06273c-f4fc-474e-824d-dd320a8064f4.jpg",
  cyborg:  "https://cdn.poehali.dev/projects/8908f6bc-a84f-4d41-836a-c95d7da5738b/files/45b66460-dc97-498a-aae1-0ff5321b1268.jpg",
  witch:   "https://cdn.poehali.dev/projects/8908f6bc-a84f-4d41-836a-c95d7da5738b/files/cfca79d1-de2a-4ce3-b1a1-0b6ac4a25ea6.jpg",
  samurai: "https://cdn.poehali.dev/projects/8908f6bc-a84f-4d41-836a-c95d7da5738b/files/110d91ae-571a-427b-b197-9e478e2b0df1.jpg",
  hero:    "https://cdn.poehali.dev/projects/8908f6bc-a84f-4d41-836a-c95d7da5738b/files/e4f8c281-4ff4-485e-9db9-3f15fc306039.jpg",
  dragon:  "https://cdn.poehali.dev/projects/8908f6bc-a84f-4d41-836a-c95d7da5738b/files/f5ff136e-bf00-4883-8543-27338b1e9807.jpg",
  god:     "https://cdn.poehali.dev/projects/8908f6bc-a84f-4d41-836a-c95d7da5738b/files/e8fa85bb-5f6d-46a3-8d2c-c6dae130d65e.jpg",
};

await mkdir(outputDir, { recursive: true });
console.log(`Output directory: ${outputDir}`);

const success = [];
const failed = [];

await Promise.all(
  Object.entries(skins).map(async ([name, url]) => {
    const dest = join(outputDir, `${name}.jpg`);
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
      const buf = await resp.arrayBuffer();
      await writeFile(dest, Buffer.from(buf));
      success.push({ name, size: buf.byteLength });
      console.log(`  [OK] ${name}.jpg  (${buf.byteLength} bytes)`);
    } catch (err) {
      failed.push({ name, error: err.message });
      console.error(`  [FAIL] ${name}.jpg  ${err.message}`);
    }
  })
);

console.log(`\nDone. ${success.length} succeeded, ${failed.length} failed.`);
if (failed.length) {
  console.error("Failed:", failed.map(f => f.name).join(", "));
}
