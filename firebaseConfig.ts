import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCDQMzT_cWCnByenhUtoW8WGP1Yr0sgMWU",
  authDomain: "fincon-b532b.firebaseapp.com",
  projectId: "fincon-b532b",
  storageBucket: "fincon-b532b.appspot.com", // fixed
  messagingSenderId: "481457736311",
  appId: "1:481457736311:web:7171320988d07c11661472"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);