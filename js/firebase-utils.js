/* 
    Firebase Utilities - Shared Firebase Functions
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    Timestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBSMb64fq5XeISSu6hykGR3d2LCLGPRg18",
    authDomain: "himrugs.firebaseapp.com",
    projectId: "himrugs",
    storageBucket: "himrugs.firebasestorage.app",
    messagingSenderId: "25546216518",
    appId: "1:25546216518:web:8fa18c9d292d042d71e647",
    measurementId: "G-LM5RY32285"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export for use in other files
export { db, app, collection, addDoc, Timestamp };

// ========== SHARED UTILITIES ==========
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Submit design/request to Firebase
export async function submitDesignRequest(fullname, contact, email, address) {
    if (!fullname || !contact || !email || !address) {
        throw new Error('All fields are required');
    }
    
    if (!isValidEmail(email)) {
        throw new Error('Invalid email address');
    }
    
    try {
        await addDoc(collection(db, 'customerRequests'), {
            type: 'design',
            fullname: fullname,
            contact: contact,
            email: email,
            address: address,
            timestamp: Timestamp.now(),
            createdAt: new Date().toLocaleString('en-IN')
        });
        
        console.log('✅ Design request submitted to Firebase');
        return true;
    } catch (error) {
        console.error('Firebase submit error:', error);
        throw error;
    }
}

// Submit message to Firebase
export async function submitMessage(fullname, contact, email, message) {
    if (!fullname || !contact || !email || !message) {
        throw new Error('All fields are required');
    }
    
    if (!isValidEmail(email)) {
        throw new Error('Invalid email address');
    }
    
    try {
        await addDoc(collection(db, 'customerRequests'), {
            type: 'message',
            fullname: fullname,
            contact: contact,
            email: email,
            message: message,
            timestamp: Timestamp.now(),
            createdAt: new Date().toLocaleString('en-IN')
        });
        
        console.log('✅ Message submitted to Firebase');
        return true;
    } catch (error) {
        console.error('Firebase submit error:', error);
        throw error;
    }
}
