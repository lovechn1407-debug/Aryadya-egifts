import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC9AXXmnk-oNpnJx1IEelQdnOXezag7aYg",
  authDomain: "aradhya-egifts.firebaseapp.com",
  databaseURL: "https://aradhya-egifts-default-rtdb.firebaseio.com",
  projectId: "aradhya-egifts",
  storageBucket: "aradhya-egifts.firebasestorage.app",
  messagingSenderId: "207850716970",
  appId: "1:207850716970:web:33da9d96c23b9c2be06853",
  measurementId: "G-6TJJCNPGES",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const database = getDatabase(app);
