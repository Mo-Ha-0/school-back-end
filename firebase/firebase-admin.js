const admin = require('firebase-admin');

// Initialize Firebase Admin SDK

const serviceAccount = require('./project-one-a5b2f-firebase-adminsdk-fbsvc-4779cc16a1.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
