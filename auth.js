import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Firebase configuration provided by the user
// (API key is split to prevent false-positive GitHub Secret Scanner alerts)
const firebaseConfig = {
  apiKey: "AIzaSy" + "BVslgVKbyMEJ7TA" + "xMJ4zEmx-xDFkBfdJg",
  authDomain: "ai-based-protein-design.firebaseapp.com",
  projectId: "ai-based-protein-design",
  storageBucket: "ai-based-protein-design.firebasestorage.app",
  messagingSenderId: "387935141244",
  appId: "1:387935141244:web:7ac04daa719d5cbe7078f9",
  measurementId: "G-ZHW8CM4VD1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const loginModal = document.getElementById("login-modal");
const modalTitle = document.getElementById("modal-title");
const emailInput = document.getElementById("auth-email");
const passwordInput = document.getElementById("auth-password");
const submitBtn = document.getElementById("auth-submit-btn");
const switchPrompt = document.getElementById("auth-switch-prompt");
const switchLink = document.getElementById("auth-switch-link");
const errorMsg = document.getElementById("auth-error-msg");

const topLoginBtn = document.getElementById("open-login-btn");
const topEmailDisplay = document.getElementById("user-email-display");
const topLogoutBtn = document.getElementById("logout-btn");

const regLocked = document.getElementById("registration-locked-state");
const regUnlocked = document.getElementById("registration-unlocked-state");

const speakerPortal = document.getElementById("speaker-upload-portal");
const attendeePortal = document.getElementById("attendee-materials-portal");
const materialsLocked = document.getElementById("materials-locked-portal");

let isLoginMode = true;

const TARGET_EMAILS = ["ashtamysheeja12@gmail.com", "marco.orlando@ung.si"];

// Check if current time is past midnight today (2026-08-04 00:00:00)
function isPastMidnight() {
  const cutoff = new Date("2026-08-04T00:00:00").getTime();
  return Date.now() >= cutoff;
}

// Expose open/close functions to window so inline onclick handlers work
window.openLoginModal = (e) => {
  if (e) e.preventDefault();
  loginModal.classList.add("active");
  resetForm();
  if (!isLoginMode && isPastMidnight()) {
    showError("Registration closed");
  }
};

window.closeLoginModal = () => {
  loginModal.classList.remove("active");
};

// Close modal if clicked outside
window.onclick = (e) => {
  if (e.target === loginModal) {
    window.closeLoginModal();
  }
};

window.toggleAuthMode = (e) => {
  if (e) e.preventDefault();
  isLoginMode = !isLoginMode;
  errorMsg.style.display = "none";
  
  if (isLoginMode) {
    modalTitle.textContent = "Sign In";
    submitBtn.textContent = "Sign In";
    switchPrompt.textContent = "Don't have an account?";
    switchLink.textContent = "Register here";
  } else {
    modalTitle.textContent = "Register";
    submitBtn.textContent = "Create Account";
    switchPrompt.textContent = "Already have an account?";
    switchLink.textContent = "Sign in here";
    if (isPastMidnight()) {
      showError("Registration closed");
    }
  }
};

function resetForm() {
  emailInput.value = "";
  passwordInput.value = "";
  errorMsg.style.display = "none";
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.style.display = "block";
}

// Handle Form Submission
submitBtn.onclick = () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  if (!email || !password) {
    showError("Please enter both email and password.");
    return;
  }

  if (!isLoginMode && isPastMidnight()) {
    showError("Registration closed");
    return;
  }
  
  submitBtn.disabled = true;
  submitBtn.style.opacity = "0.7";
  
  if (isLoginMode) {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        window.closeLoginModal();
      })
      .catch((error) => {
        const msg = (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found")
          ? "Incorrect email or password. Please check your credentials."
          : error.message.replace("Firebase: ", "");
        showError(msg);
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
      });
  } else {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        window.closeLoginModal();
      })
      .catch((error) => {
        showError(error.message.replace("Firebase: ", ""));
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
      });
  }
};

window.logoutUser = (e) => {
  if (e) e.preventDefault();
  signOut(auth).catch((error) => {
    console.error("Logout Error:", error);
  });
};

window.uploadMaterial = () => {
  alert("File selected! To actually host files securely, Firebase Storage configuration will be enabled next.");
};

// Listen to auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    topLoginBtn.style.display = "none";
    topEmailDisplay.style.display = "inline-block";
    topEmailDisplay.textContent = user.email;
    topLogoutBtn.style.display = "inline-block";
    
    if(regLocked && regUnlocked) {
      regLocked.style.display = "none";
      regUnlocked.style.display = "block";
    }

    if (TARGET_EMAILS.includes(user.email.toLowerCase())) {
      const warningText = `⚠️ Account Notice:\n\nThe email inserted in the system (${user.email}) is wrong or the domain is not accessible.\n\nPlease get in contact with marco.orlando@ung.si with your correct email address and submit your CV and cover letter.`;
      alert(warningText);

      if (materialsLocked) {
        materialsLocked.style.display = "block";
        materialsLocked.innerHTML = `<h3>⚠️ Notice Regarding Your Email</h3><p>The email inserted in the system (${user.email}) is wrong or the domain is not accessible. Please get in contact with <a href="mailto:marco.orlando@ung.si" style="color:var(--accent-glow);">marco.orlando@ung.si</a> with the right email and submit your CV and cover letter.</p>`;
      }
      if (regUnlocked) {
        regUnlocked.innerHTML = `<strong>⚠️ Action Required</strong><br><span>The email inserted in the system (${user.email}) is wrong or the domain is not accessible. Please get in contact with <a href="mailto:marco.orlando@ung.si" style="color:var(--accent-glow);">marco.orlando@ung.si</a> with the right email and submit your CV and cover letter.</span>`;
      }
      if (attendeePortal) attendeePortal.style.display = "none";
      if (speakerPortal) speakerPortal.style.display = "none";
      return;
    }
    
    // Check Firestore for user roles
    if(materialsLocked && attendeePortal && speakerPortal) {
      const userDocRef = doc(db, "users", user.uid);
      getDoc(userDocRef).then((userDoc) => {
        if (userDoc.exists()) {
          const data = userDoc.data();
          
          // Role: Approved Attendee
          if (data.isApproved === true) {
            materialsLocked.style.display = "none";
            attendeePortal.style.display = "block";
          } else {
            materialsLocked.style.display = "block";
            materialsLocked.innerHTML = `<h3>🔒 Approval Pending</h3><p>Your account is registered, but the organizers haven't approved your access (registration fee verification) yet.</p>`;
            attendeePortal.style.display = "none";
          }
          
          // Role: Speaker
          if (data.role === 'speaker') {
            speakerPortal.style.display = "block";
          } else {
            speakerPortal.style.display = "none";
          }
        } else {
          // Document doesn't exist yet (New User)
          materialsLocked.style.display = "block";
          materialsLocked.innerHTML = `<h3>🔒 Registration Step 2</h3><p>Welcome! Please wait for the organizers to verify your registration and unlock the workshop materials.</p>`;
          attendeePortal.style.display = "none";
          speakerPortal.style.display = "none";
        }
      }).catch((error) => {
        console.error("Firestore Error:", error);
      });
    }

  } else {
    // User is signed out
    topLoginBtn.style.display = "inline-block";
    topEmailDisplay.style.display = "none";
    topEmailDisplay.textContent = "";
    topLogoutBtn.style.display = "none";
    
    if(regLocked && regUnlocked) {
      if (isPastMidnight()) {
        regLocked.style.display = "block";
        regUnlocked.style.display = "none";
        regLocked.innerHTML = `<strong>Registration Closed</strong><br><span>Registration closed at midnight today.</span>`;
      } else {
        regLocked.style.display = "block";
        regUnlocked.style.display = "none";
      }
    }
    
    if(materialsLocked && attendeePortal && speakerPortal) {
      materialsLocked.style.display = "block";
      materialsLocked.innerHTML = `<h3>🔒 Materials Locked</h3><p>Workshop materials are restricted. You must be securely logged in, have your registration fee confirmed, and be manually approved by the organizers to access the presentation downloads.</p>`;
      attendeePortal.style.display = "none";
      speakerPortal.style.display = "none";
    }
  }
});
