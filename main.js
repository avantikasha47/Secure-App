import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getFirestore, collection, addDoc, doc, getDocs, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js';

const firebaseConfig = {
    apiKey: "AIzaSyBOQaY6vyzj_8avbxM97a87TMeWV2Zoip4",
    authDomain: "app-28e44.firebaseapp.com",
    projectId: "app-28e44",
    storageBucket: "app-28e44.appspot.com",
    messagingSenderId: "649352018190",
    appId: "1:649352018190:web:c3749340794b0be7573f5f",
    measurementId: "G-F7FMML96KV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let currentUserName = '';

// DOM Elements
const loginButton = document.getElementById('login');
const registerButton = document.getElementById('register');
const uploadButton = document.getElementById('upload');
const fileInput = document.getElementById('file-upload');
const documentList = document.getElementById('document-list');
const messageContainer = document.getElementById('message-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const documentContainer = document.getElementById('document-container');

// Show message on UI
function showMessage(message, isError = false) {
    const messageContainer = document.getElementById('message-container');
    messageContainer.textContent = message;
    messageContainer.style.color = isError ? 'red' : 'green';
    setTimeout(() => {
        messageContainer.textContent = '';
    }, 3000);
}

// Login functionality
loginButton.addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            showMessage('Successfully logged in!');
            loginForm.style.display = 'none'; // Hide login form after successful login
            documentContainer.style.display = 'block'; // Show document container
            showDocuments(); // Show documents after login
        })
        .catch((error) => {
            showMessage(`Login error: ${error.message}`, true);
        });
});

// Register functionality
registerButton.onclick = async () => {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    currentUserName = document.getElementById('register-name').value; // Capture the user's name

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        showMessage('Registration successful! Please log in.');
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    } catch (error) {
        showMessage(`Registration error: ${error.message}`, true);
    }
};

// Upload document functionality
uploadButton.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (file) {
        const storageRef = ref(storage, `documents/${file.name}`);
        uploadBytes(storageRef, file).then((snapshot) => {
            getDownloadURL(snapshot.ref).then((downloadURL) => {
                addDoc(collection(db, 'documents'), {
                    userName: currentUserName, // Save the user's name who uploaded the document
                    fileName: file.name,
                    url: downloadURL,
                    uploadedAt: new Date()
                }).then(() => {
                    showMessage('Document successfully uploaded!');
                    fileInput.value = ''; // Clear the file input
                    showDocuments(); // Refresh document list
                }).catch((error) => {
                    showMessage(`Error adding document to database: ${error.message}`, true);
                });
            }).catch((error) => {
                showMessage(`Error getting download URL: ${error.message}`, true);
            });
        }).catch((error) => {
            showMessage(`Error uploading file: ${error.message}`, true);
        });
    } else {
        showMessage('Please select a file to upload', true);
    }
});

// Delete document functionality
function deleteDocument(docId) {
    const documentRef = doc(db, 'documents', docId);
    deleteDoc(documentRef)
        .then(() => {
            showMessage('Document successfully deleted!');
            showDocuments(); // Refresh document list
        })
        .catch((error) => {
            showMessage(`Error deleting document: ${error.message}`, true);
        });
}

// Show documents uploaded by all users
function showDocuments() {
    documentList.innerHTML = ''; // Clear the current document list
    getDocs(collection(db, 'documents')).then((querySnapshot) => {
        if (querySnapshot.empty) {
            showMessage('No documents found. Upload some!');
        } else {
            querySnapshot.forEach((doc) => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = doc.data().url;
                a.textContent = doc.data().fileName;
                a.target = '_blank';

                // Create a span to show the user name
                const userNameSpan = document.createElement('span');
                userNameSpan.textContent = ` (Uploaded by: ${doc.data().userName})`;
                userNameSpan.style.fontWeight = 'bold';

                // Create delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = '×';
                deleteButton.className = 'delete-button';
                deleteButton.onclick = () => {
                    deleteDocument(doc.id); // Call delete function with the correct ID
                };

                li.appendChild(a);
                li.appendChild(userNameSpan); // Append user name to the list item
                li.appendChild(deleteButton);
                documentList.appendChild(li);
            });
        }
    }).catch((error) => {
        showMessage(`Error fetching documents: ${error.message}`, true);
    });
}

// Toggle between login and register forms
function toggleAuthMode() {
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

// Toggle buttons for switching forms
document.getElementById('toggle-register').addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthMode();
});
document.getElementById('toggle-login').addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthMode();
});
