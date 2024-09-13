import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDUuGd97Hvjuf08UQHIXXcl7nw2ahZndtY",

  authDomain: "quiz-app-login-63a7d.firebaseapp.com",

  projectId: "quiz-app-login-63a7d",

  storageBucket: "quiz-app-login-63a7d.appspot.com",

  messagingSenderId: "239198028507",

  appId: "1:239198028507:web:b40b5520ceeff3ea6b42fe",

  measurementId: "G-7Z62YJB490",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
