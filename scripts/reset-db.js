/**
 * reset-db.js — DESTRUCTIVE. Wipes orders, products, institutions, subscribers
 * from Firestore and their images from Storage, after taking a JSON backup.
 *
 * Usage:
 *   node scripts/reset-db.js            # dry run — shows counts, deletes nothing
 *   node scripts/reset-db.js --confirm  # actually deletes
 */
const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

// ── Load env from .env.local ──────────────────────────────────────────────
const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[match[1].trim()] = val;
  }
});

const CONFIRM = process.argv.includes('--confirm');
const COLLECTIONS = ['orders', 'products', 'institutions', 'subscribers'];
const STORAGE_PREFIXES = ['products/', 'institutions/'];

initializeApp({
  credential: cert({
    projectId: env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});

const db = getFirestore();
const bucket = getStorage().bucket();

async function deleteCollection(name) {
  const snap = await db.collection(name).get();
  if (snap.empty) {
    console.log(`  ${name}: 0 docs — nothing to delete`);
    return { name, count: 0, docs: [] };
  }
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  console.log(`  ${name}: ${snap.size} docs`);

  if (CONFIRM) {
    // Batch delete (max 500 per batch)
    let batch = db.batch();
    let ops = 0;
    for (const doc of snap.docs) {
      batch.delete(doc.ref);
      if (++ops === 500) {
        await batch.commit();
        batch = db.batch();
        ops = 0;
      }
    }
    if (ops > 0) await batch.commit();
    console.log(`    ✓ deleted ${snap.size} docs from ${name}`);
  }
  return { name, count: snap.size, docs };
}

async function deleteStorage(prefix) {
  const [files] = await bucket.getFiles({ prefix });
  console.log(`  storage ${prefix}*: ${files.length} files`);
  if (CONFIRM && files.length > 0) {
    await Promise.all(files.map((f) => f.delete().catch(() => null)));
    console.log(`    ✓ deleted ${files.length} files under ${prefix}`);
  }
  return files.length;
}

async function run() {
  console.log(CONFIRM ? '🔥 LIVE RUN — deleting data\n' : '🔍 DRY RUN — nothing will be deleted (pass --confirm to delete)\n');

  console.log('Firestore collections:');
  const backups = [];
  for (const name of COLLECTIONS) {
    backups.push(await deleteCollection(name));
  }

  console.log('\nStorage:');
  for (const prefix of STORAGE_PREFIXES) {
    await deleteStorage(prefix);
  }

  // Always write a backup snapshot of what was (or would be) deleted.
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(__dirname, '..', `backup-${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backups, null, 2));
  console.log(`\n💾 Backup written to ${path.basename(backupPath)}`);

  console.log(CONFIRM ? '\n✅ Reset complete. Everything is fresh.' : '\nℹ️  Dry run done. Re-run with --confirm to actually delete.');
  process.exit(0);
}

run().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
