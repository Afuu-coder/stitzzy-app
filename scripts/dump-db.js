const fs = require('fs');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    env[match[1].trim()] = val;
  }
});

const serviceAccount = {
  projectId: env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
};

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function run() {
  const insts = await db.collection('institutions').get();
  console.log("--- INSTITUTIONS ---");
  insts.forEach(doc => console.log(doc.id, doc.data()));

  const prods = await db.collection('products').get();
  console.log("\n--- PRODUCTS ---");
  prods.forEach(doc => console.log(doc.id, doc.data()));
}

run();
