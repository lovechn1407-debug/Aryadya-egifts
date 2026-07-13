const fs = require('fs');
const envStr = fs.readFileSync('.env.local', 'utf8');
const env = {};
envStr.split('\n').forEach(l => {
  if (l.includes('=')) {
    const idx = l.indexOf('=');
    const k = l.substring(0, idx).trim();
    const v = l.substring(idx + 1).trim().replace(/^"|"$/g, '');
    env[k] = v;
  }
});
const cfBase = env.CASHFREE_MODE === 'production' ? 'https://api.cashfree.com' : 'https://sandbox.cashfree.com';

const admin = require('firebase-admin');
if (!admin.apps.length) { 
  admin.initializeApp({ 
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    }) 
  }); 
}
const db = admin.firestore();

async function run() {
  const snapshot = await db.collection('orders').where('status', '==', 'pending').limit(10).get();
  for (const doc of snapshot.docs) {
    const o = doc.data();
    console.log('Order:', doc.id, o.amount);
    const res = await fetch(cfBase + '/pg/orders/' + doc.id + '/payments', {
      headers: {
        'x-client-id': env.CASHFREE_APP_ID,
        'x-client-secret': env.CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01'
      }
    });
    if (res.ok) {
       const body = await res.json();
       console.log('CF payments length:', body.length);
       if (body.length > 0) {
         console.log('First payment:', body[0]);
       }
    } else {
       console.log('CF error:', res.status, await res.text());
    }
  }
}
run().then(() => process.exit(0)).catch(console.error);
