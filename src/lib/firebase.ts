// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import {getDownloadURL, getStorage, ref, uploadBytesResumable} from 'firebase/storage'

// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_APP_ID,
//   measurementId: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_MEASUREMENT_ID
// };

// // Initialize Firebase
// // const app = initializeApp(firebaseConfig);
// export const app = initializeApp(firebaseConfig);
// export const storage = getStorage(app)

// // setProgress is to keep track of % of file uploaded
// export async function uploadFile(file: File, setProgress?: (progress: number) => void) {
//     return new Promise((result, reject) => {
//         try {
//           const storageRef = ref(storage, file.name);
//           const uploadTask = uploadBytesResumable(storageRef, file);
    
//           uploadTask.on(
//             'state_changed',
//             (snapshot) => {
//               const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
//               if (setProgress) setProgress(progress);
              
//               switch (snapshot.state) {
//                 case 'paused':
//                   console.log('Upload is paused');
//                   break;
//                 case 'running':
//                   console.log('Upload is running');
//                   break;
//                 case 'error':
//                   console.error('Upload failed');
//                   break;
//                 case 'success':
//                   console.log('Upload completed');
//                   break;
//                 default:
//                   console.log('Unknown state:', snapshot.state);
//               }
//             },
//             (error) => {
//               // Handle unsuccessful uploads
//               console.error('Upload error:', error);
//               reject(error);
//             },
//             () => {
//               // Handle successful uploads on complete
//               getDownloadURL(uploadTask.snapshot.ref)
//                 .then((downloadURL) => {
//                   result(downloadURL as string);
//                 // resolve(downloadURL as string);
//                 })
//                 .catch((error) => {
//                   reject(error);
//                 });
//             }
//           );
//         } catch (error) {
//           console.error(error);
//           reject(error);
//         }
//     });
// }

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from 'firebase/storage'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyBboEC6Vn2fERbfA0FuFovOR-bI1wTj_B8",
//   authDomain: "clarity-440f3.firebaseapp.com",
//   projectId: "clarity-440f3",
//   storageBucket: "clarity-440f3.firebasestorage.app",
//   messagingSenderId: "1059108994292",
//   appId: "1:1059108994292:web:1038512c7da7efb21a72a1",
//   measurementId: "G-5VHM5B7T71"
// };
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_MEASUREMENT_ID
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)
// console.log('Firebase Storage bucket:', storage.app.options.storageBucket);
// setProgress is to keep track of % of file uploaded
export async function uploadFile(file: File, setProgress?: (progress: number) => void) {
    return new Promise((result, reject) => {
        try {
          const storageRef = ref(storage, file.name);
          const uploadTask = uploadBytesResumable(storageRef, file);
    
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              if (setProgress) setProgress(progress);
              
              switch (snapshot.state) {
                case 'paused':
                  console.log('Upload is paused');
                  break;
                case 'running':
                  console.log('Upload is running');
                  break;
                case 'error':
                  console.error('Upload failed');
                  break;
                case 'success':
                  console.log('Upload completed');
                  break;
                default:
                  console.log('Unknown state:', snapshot.state);
              }
            },
            (error) => {
              // Handle unsuccessful uploads
              console.error('Upload error:', error);
              reject(error);
            },
            () => {
              // Handle successful uploads on complete
              getDownloadURL(uploadTask.snapshot.ref)
                .then((downloadURL) => {
                  result(downloadURL as string);
                // resolve(downloadURL as string);
                })
                .catch((error) => {
                  reject(error);
                });
            }
          );
        } catch (error) {
          console.error(error);
          reject(error);
        }
    });
}