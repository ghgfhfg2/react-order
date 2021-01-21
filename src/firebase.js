import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
  apiKey: "AIzaSyCEyTRsaYeSg_dz7UVdnuEEMgZxBTTHzIY",
  authDomain: "cafe-order-226e3.firebaseapp.com",
  projectId: "cafe-order-226e3",
  storageBucket: "cafe-order-226e3.appspot.com",
  messagingSenderId: "676427099091",
  appId: "1:676427099091:web:0a90da4aef819f4b1f5d26",
  measurementId: "G-RHK1VSB0WX",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//firebase.analytics();

export default firebase;
