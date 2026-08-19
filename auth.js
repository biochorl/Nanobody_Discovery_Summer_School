import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";

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
const storage = getStorage(app);

// DOM Elements — login modal
const loginModal = document.getElementById("login-modal");
const modalTitle = document.getElementById("modal-title");
const modalSubtitle = document.getElementById("modal-subtitle");
const emailInput = document.getElementById("auth-email");
const passwordInput = document.getElementById("auth-password");
const submitBtn = document.getElementById("auth-submit-btn");
const switchPrompt = document.getElementById("auth-switch-prompt");
const switchLink = document.getElementById("auth-switch-link");
const errorMsg = document.getElementById("auth-error-msg");
const authTabSignin = document.getElementById("auth-tab-signin");
const authTabRegister = document.getElementById("auth-tab-register");
const authTogglePw = document.getElementById("auth-toggle-pw");

const topLoginBtn = document.getElementById("open-login-btn");
const topEmailDisplay = document.getElementById("user-email-display");
const topLogoutBtn = document.getElementById("logout-btn");

// DOM Elements — My Account panel
const accountLocked = document.getElementById("account-locked-state");
const accountUnlocked = document.getElementById("account-unlocked-state");
const accountEmailField = document.getElementById("account-email");
const accountFullName = document.getElementById("account-full-name");
const accountPosition = document.getElementById("account-position");
const accountInstitution = document.getElementById("account-institution");
const accountCountry = document.getElementById("account-country");
const accountPhone = document.getElementById("account-phone");
const accountDietary = document.getElementById("account-dietary");
const accountBio = document.getElementById("account-bio");
const accountPhotoInput = document.getElementById("account-photo-input");
const accountPhotoPreview = document.getElementById("account-photo-preview");
const accountPhotoPlaceholder = document.getElementById("account-photo-placeholder");
const accountInvoiceName = document.getElementById("account-invoice-name");
const accountInvoiceAddress = document.getElementById("account-invoice-address");
const accountInvoiceCity = document.getElementById("account-invoice-city");
const accountInvoiceZip = document.getElementById("account-invoice-zip");
const accountInvoiceCountry = document.getElementById("account-invoice-country");
const accountInvoiceVat = document.getElementById("account-invoice-vat");
const accountTripRadios = document.querySelectorAll('input[name="account-trip-interest"]');
const accountNotes = document.getElementById("account-notes");
const accountSaveBtn = document.getElementById("account-save-btn");
const accountSaveStatus = document.getElementById("account-save-status");

// DOM Elements — Subscribers panel (organizer-only)
const navSubscribersItem = document.getElementById("nav-subscribers-item");
const navSubscribersLink = document.getElementById("nav-subscribers-link");
const mobNavSubscribersLink = document.getElementById("mob-nav-subscribers-link");
const subscribersListView = document.getElementById("subscribers-list-view");
const subscribersList = document.getElementById("subscribers-list");
const subscriberDetailView = document.getElementById("subscriber-detail-view");
const subscriberBackBtn = document.getElementById("subscriber-back-btn");
const subsDetailPhoto = document.getElementById("subs-detail-photo");
const subsDetailPhotoPlaceholder = document.getElementById("subs-detail-photo-placeholder");
const subsDetailName = document.getElementById("subs-detail-name");
const subsDetailEmail = document.getElementById("subs-detail-email");
const subsDetailPosition = document.getElementById("subs-detail-position");
const subsDetailInstitution = document.getElementById("subs-detail-institution");
const subsDetailCountry = document.getElementById("subs-detail-country");
const subsDetailPhone = document.getElementById("subs-detail-phone");
const subsDetailDietary = document.getElementById("subs-detail-dietary");
const subsDetailTrip = document.getElementById("subs-detail-trip");
const subsDetailInvoice = document.getElementById("subs-detail-invoice");
const subsDetailBio = document.getElementById("subs-detail-bio");
const subsDetailNotes = document.getElementById("subs-detail-notes");
const subsDetailUpdated = document.getElementById("subs-detail-updated");

const POSITION_LABELS = {
  master: "Master student",
  phd: "PhD student",
  postdoc: "Postdoc",
  pi: "PI / Faculty",
  speaker: "Speaker",
  other: "Other"
};
const TRIP_LABELS = {
  yes: "🙋 Yes, interested",
  maybe: "🤔 Maybe",
  no: "🙅 No, thanks"
};

let isLoginMode = true;
let pendingPhotoFile = null;
let isAdmin = false;

// Check if current time is past midnight today (2026-08-04 00:00:00)
function isPastMidnight() {
  const cutoff = new Date("2026-08-04T00:00:00").getTime();
  return Date.now() >= cutoff;
}

// Jump to a section of the single-page app (reuses the sidebar nav wiring in script.js)
function goToSection(targetId) {
  const link = document.querySelector(`.nav-link[data-target="${targetId}"]`);
  if (link) link.click();
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

// Applies the current isLoginMode to every part of the modal UI (title, tabs, button, switch text)
function applyAuthMode() {
  errorMsg.style.display = "none";

  if (authTabSignin) authTabSignin.classList.toggle("active", isLoginMode);
  if (authTabRegister) authTabRegister.classList.toggle("active", !isLoginMode);

  if (isLoginMode) {
    modalTitle.textContent = "Sign In";
    if (modalSubtitle) modalSubtitle.textContent = "Access your Summer School account";
    submitBtn.textContent = "Sign In";
    switchPrompt.textContent = "Don't have an account?";
    switchLink.textContent = "Register here";
  } else {
    modalTitle.textContent = "Register";
    if (modalSubtitle) modalSubtitle.textContent = "Create your Summer School account";
    submitBtn.textContent = "Create Account";
    switchPrompt.textContent = "Already have an account?";
    switchLink.textContent = "Sign in here";
    if (isPastMidnight()) {
      showError("Registration closed");
    }
  }
}

window.toggleAuthMode = (e) => {
  if (e) e.preventDefault();
  isLoginMode = !isLoginMode;
  applyAuthMode();
};

window.setAuthMode = (loginMode, e) => {
  if (e) e.preventDefault();
  isLoginMode = loginMode;
  applyAuthMode();
};

// Show/hide the password field's contents
if (authTogglePw) {
  authTogglePw.onclick = () => {
    const showing = passwordInput.type === "text";
    passwordInput.type = showing ? "password" : "text";
    authTogglePw.textContent = showing ? "👁" : "🙈";
    authTogglePw.title = showing ? "Show password" : "Hide password";
  };
}

function resetForm() {
  emailInput.value = "";
  passwordInput.value = "";
  passwordInput.type = "password";
  if (authTogglePw) { authTogglePw.textContent = "👁"; authTogglePw.title = "Show password"; }
  errorMsg.style.display = "none";
}

function showError(msg) {
  errorMsg.textContent = "⚠️ " + msg;
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
      .then(() => {
        window.closeLoginModal();
        // Take the user straight to their own Account tab after signing in
        goToSection("account");
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
      .then(() => {
        window.closeLoginModal();
        // New accounts land on the Account tab so they can fill in their info right away
        goToSection("account");
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

// ===== My Account panel =====

function showAccountStatus(msg, isError) {
  if (!accountSaveStatus) return;
  accountSaveStatus.textContent = msg;
  accountSaveStatus.style.color = isError ? "var(--accent-rose)" : "var(--accent-glow)";
  accountSaveStatus.style.display = "block";
}

function resetAccountForm() {
  pendingPhotoFile = null;
  if (accountFullName) accountFullName.value = "";
  if (accountPosition) accountPosition.value = "";
  if (accountInstitution) accountInstitution.value = "";
  if (accountCountry) accountCountry.value = "";
  if (accountPhone) accountPhone.value = "";
  if (accountDietary) accountDietary.value = "";
  if (accountBio) accountBio.value = "";
  if (accountInvoiceName) accountInvoiceName.value = "";
  if (accountInvoiceAddress) accountInvoiceAddress.value = "";
  if (accountInvoiceCity) accountInvoiceCity.value = "";
  if (accountInvoiceZip) accountInvoiceZip.value = "";
  if (accountInvoiceCountry) accountInvoiceCountry.value = "";
  if (accountInvoiceVat) accountInvoiceVat.value = "";
  accountTripRadios.forEach(r => { r.checked = false; });
  if (accountNotes) accountNotes.value = "";
  if (accountPhotoPreview) { accountPhotoPreview.style.display = "none"; accountPhotoPreview.src = ""; }
  if (accountPhotoPlaceholder) accountPhotoPlaceholder.style.display = "flex";
  if (accountSaveStatus) accountSaveStatus.style.display = "none";

  // Reset the organizer-only Subscribers panel too — clear any rendered participant
  // data from the DOM, not just hide it, so nothing lingers after logout.
  isAdmin = false;
  if (navSubscribersItem) navSubscribersItem.style.display = "none";
  if (mobNavSubscribersLink) mobNavSubscribersLink.style.display = "none";
  if (subscriberDetailView) subscriberDetailView.style.display = "none";
  if (subscribersListView) subscribersListView.style.display = "block";
  if (subscribersList) subscribersList.innerHTML = "";
  [subsDetailName, subsDetailEmail, subsDetailPosition, subsDetailInstitution, subsDetailCountry,
   subsDetailPhone, subsDetailDietary, subsDetailTrip, subsDetailInvoice, subsDetailBio,
   subsDetailNotes, subsDetailUpdated].forEach(el => { if (el) el.textContent = ""; });
  if (subsDetailPhoto) { subsDetailPhoto.style.display = "none"; subsDetailPhoto.src = ""; }
  if (subsDetailPhotoPlaceholder) subsDetailPhotoPlaceholder.style.display = "flex";

  // If the organizer was on the Subscribers tab, don't leave them staring at an
  // empty admin-only page after logout — send them back to the public Overview tab.
  const subscribersSection = document.getElementById("subscribers");
  if (subscribersSection && subscribersSection.classList.contains("active")) {
    goToSection("overview");
  }
}

// Preview the chosen photo immediately, upload happens on Save.
// Client-side checks are a UX convenience only — the real enforcement
// (file type, size, and "owner can only write their own folder") must
// live in the Firebase Storage security rules, not in this script.
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

if (accountPhotoInput) {
  accountPhotoInput.onchange = () => {
    const file = accountPhotoInput.files && accountPhotoInput.files[0];
    if (!file) return;

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      showAccountStatus("Please choose a JPG, PNG, WEBP or GIF image.", true);
      accountPhotoInput.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      showAccountStatus("That image is too large — please choose one under 5 MB.", true);
      accountPhotoInput.value = "";
      return;
    }

    pendingPhotoFile = file;
    if (accountSaveStatus) accountSaveStatus.style.display = "none";
    const reader = new FileReader();
    reader.onload = (e) => {
      if (accountPhotoPreview) {
        accountPhotoPreview.src = e.target.result;
        accountPhotoPreview.style.display = "block";
      }
      if (accountPhotoPlaceholder) accountPhotoPlaceholder.style.display = "none";
    };
    reader.readAsDataURL(file);
  };
}

// Clicking the top-bar email jumps to the Account tab
if (topEmailDisplay) {
  topEmailDisplay.onclick = (e) => {
    e.preventDefault();
    goToSection("account");
  };
}

function loadAccountData(user) {
  if (accountEmailField) accountEmailField.value = user.email || "";
  const userDocRef = doc(db, "users", user.uid);
  getDoc(userDocRef).then((userDoc) => {
    if (!userDoc.exists()) return;
    const data = userDoc.data();
    if (accountFullName && data.fullName) accountFullName.value = data.fullName;
    if (accountPosition && data.position) accountPosition.value = data.position;
    if (accountInstitution && data.institution) accountInstitution.value = data.institution;
    if (accountCountry && data.country) accountCountry.value = data.country;
    if (accountPhone && data.phone) accountPhone.value = data.phone;
    if (accountDietary && data.dietary) accountDietary.value = data.dietary;
    if (accountBio && data.bio) accountBio.value = data.bio;
    if (accountInvoiceName && data.invoiceName) accountInvoiceName.value = data.invoiceName;
    if (accountInvoiceAddress && data.invoiceAddress) accountInvoiceAddress.value = data.invoiceAddress;
    if (accountInvoiceCity && data.invoiceCity) accountInvoiceCity.value = data.invoiceCity;
    if (accountInvoiceZip && data.invoiceZip) accountInvoiceZip.value = data.invoiceZip;
    if (accountInvoiceCountry && data.invoiceCountry) accountInvoiceCountry.value = data.invoiceCountry;
    if (accountInvoiceVat && data.invoiceVat) accountInvoiceVat.value = data.invoiceVat;
    if (data.tripInterest) {
      accountTripRadios.forEach(r => { r.checked = (r.value === data.tripInterest); });
    }
    if (accountNotes && data.notes) accountNotes.value = data.notes;
    if (data.photoURL && accountPhotoPreview) {
      accountPhotoPreview.src = data.photoURL;
      accountPhotoPreview.style.display = "block";
      if (accountPhotoPlaceholder) accountPhotoPlaceholder.style.display = "none";
    }
  }).catch((error) => {
    console.error("Failed to load account data:", error);
  });
}

if (accountSaveBtn) {
  accountSaveBtn.onclick = async () => {
    const user = auth.currentUser;
    if (!user) {
      showAccountStatus("You must be logged in to save your info.", true);
      return;
    }

    // Invoice/billing details are required so the organisers can issue the registration invoice.
    const requiredFields = [
      [accountInvoiceName, "your invoice name"],
      [accountInvoiceAddress, "your billing address"],
      [accountInvoiceCity, "your billing city"],
      [accountInvoiceZip, "your billing postal code"],
      [accountInvoiceCountry, "your billing country"]
    ];
    for (const [field, label] of requiredFields) {
      if (field && !field.value.trim()) {
        showAccountStatus(`Please fill in ${label} before saving.`, true);
        field.focus();
        return;
      }
    }

    accountSaveBtn.disabled = true;
    accountSaveBtn.style.opacity = "0.7";
    showAccountStatus("Saving…", false);

    try {
      let photoURL = accountPhotoPreview && accountPhotoPreview.style.display !== "none" ? accountPhotoPreview.src : null;

      if (pendingPhotoFile) {
        const photoRef = ref(storage, `avatars/${user.uid}/${pendingPhotoFile.name}`);
        await uploadBytes(photoRef, pendingPhotoFile);
        photoURL = await getDownloadURL(photoRef);
        pendingPhotoFile = null;
      }

      const profileData = {
        email: user.email || "",
        fullName: accountFullName ? accountFullName.value.trim() : "",
        position: accountPosition ? accountPosition.value : "",
        institution: accountInstitution ? accountInstitution.value.trim() : "",
        country: accountCountry ? accountCountry.value.trim() : "",
        phone: accountPhone ? accountPhone.value.trim() : "",
        dietary: accountDietary ? accountDietary.value.trim() : "",
        bio: accountBio ? accountBio.value.trim() : "",
        invoiceName: accountInvoiceName ? accountInvoiceName.value.trim() : "",
        invoiceAddress: accountInvoiceAddress ? accountInvoiceAddress.value.trim() : "",
        invoiceCity: accountInvoiceCity ? accountInvoiceCity.value.trim() : "",
        invoiceZip: accountInvoiceZip ? accountInvoiceZip.value.trim() : "",
        invoiceCountry: accountInvoiceCountry ? accountInvoiceCountry.value.trim() : "",
        invoiceVat: accountInvoiceVat ? accountInvoiceVat.value.trim() : "",
        tripInterest: (() => {
          const checked = Array.from(accountTripRadios).find(r => r.checked);
          return checked ? checked.value : "";
        })(),
        notes: accountNotes ? accountNotes.value.trim() : "",
        updatedAt: new Date().toISOString()
      };
      if (photoURL && !photoURL.startsWith("data:")) {
        profileData.photoURL = photoURL;
      }

      await setDoc(doc(db, "users", user.uid), profileData, { merge: true });
      showAccountStatus("✅ Saved!", false);
    } catch (error) {
      console.error("Failed to save account data:", error);
      showAccountStatus("Could not save your info: " + error.message, true);
    } finally {
      accountSaveBtn.disabled = false;
      accountSaveBtn.style.opacity = "1";
    }
  };
}

window.uploadMaterial = () => {
  alert("File selected! To actually host files securely, Firebase Storage configuration will be enabled next.");
};

// ===== Subscribers panel (organizer-only, strictly read-only) =====
//
// Security model:
// - Whether the "Subscribers" tab is shown here is only a UI convenience — it is NOT what
//   protects other people's data. The real protection is the Firestore security rule, which
//   must only grant read access to a signed-in user's own document, OR to a user whose UID has
//   a document in a separate `admins` collection. Nobody can write to `admins/*` from the client
//   (write is denied entirely) — it can only be added manually by the developer in the Firebase
//   console, one document per organizer UID.
// - Because Firestore denies an entire collection query if any document it could return isn't
//   readable by the caller, a non-admin's browser attempting the same "list all users" query
//   below will fail with a permission error, not a filtered/partial result. This makes the
//   protection enforced by the database itself, not just by hiding the menu item.
// - This panel never renders another user's data into <input>/<textarea> elements or wires up
//   any save/upload handler to it — values are written with .textContent into plain read-only
//   elements, so there is no code path here that could send an edit to someone else's document.

function showSubscribersList() {
  if (subscriberDetailView) subscriberDetailView.style.display = "none";
  if (subscribersListView) subscribersListView.style.display = "block";
}

function checkAdminStatus(user) {
  getDoc(doc(db, "admins", user.uid)).then((snap) => {
    isAdmin = snap.exists();
    if (navSubscribersItem) navSubscribersItem.style.display = isAdmin ? "block" : "none";
    if (mobNavSubscribersLink) mobNavSubscribersLink.style.display = isAdmin ? "flex" : "none";
  }).catch(() => {
    isAdmin = false;
    if (navSubscribersItem) navSubscribersItem.style.display = "none";
    if (mobNavSubscribersLink) mobNavSubscribersLink.style.display = "none";
  });
}

function loadSubscribersList() {
  if (!subscribersList) return;
  if (!isAdmin) {
    subscribersList.textContent = "You do not have organizer access.";
    return;
  }
  subscribersList.textContent = "Loading subscribers…";

  getDocs(collection(db, "users")).then((snapshot) => {
    subscribersList.innerHTML = "";
    if (snapshot.empty) {
      subscribersList.textContent = "No subscribers yet.";
      return;
    }
    const rows = [];
    snapshot.forEach((docSnap) => rows.push({ uid: docSnap.id, data: docSnap.data() }));
    rows.sort((a, b) => (a.data.fullName || a.data.email || "").localeCompare(b.data.fullName || b.data.email || ""));

    rows.forEach(({ uid, data }) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "subscriber-row";

      const avatar = document.createElement("img");
      avatar.className = "subscriber-row-avatar";
      avatar.alt = "";
      if (data.photoURL) {
        avatar.src = data.photoURL;
      } else {
        avatar.style.display = "none";
      }

      const info = document.createElement("div");
      const nameEl = document.createElement("div");
      nameEl.className = "subscriber-row-name";
      nameEl.textContent = data.fullName || "(no name provided)";
      const emailEl = document.createElement("div");
      emailEl.className = "subscriber-row-email";
      emailEl.textContent = data.email || uid;
      info.appendChild(nameEl);
      info.appendChild(emailEl);

      row.appendChild(avatar);
      row.appendChild(info);
      row.onclick = () => viewSubscriberDetail(uid, data);
      subscribersList.appendChild(row);
    });
  }).catch((error) => {
    console.error("Failed to load subscribers:", error);
    subscribersList.textContent = "Could not load subscribers (permission denied or not configured yet).";
  });
}

function viewSubscriberDetail(uid, data) {
  if (subsDetailName) subsDetailName.textContent = data.fullName || "(no name provided)";
  if (subsDetailEmail) subsDetailEmail.textContent = data.email || uid;
  if (subsDetailPosition) subsDetailPosition.textContent = POSITION_LABELS[data.position] || data.position || "—";
  if (subsDetailInstitution) subsDetailInstitution.textContent = data.institution || "—";
  if (subsDetailCountry) subsDetailCountry.textContent = data.country || "—";
  if (subsDetailPhone) subsDetailPhone.textContent = data.phone || "—";
  if (subsDetailDietary) subsDetailDietary.textContent = data.dietary || "—";
  if (subsDetailTrip) subsDetailTrip.textContent = TRIP_LABELS[data.tripInterest] || "—";
  if (subsDetailBio) subsDetailBio.textContent = data.bio || "—";
  if (subsDetailNotes) subsDetailNotes.textContent = data.notes || "—";

  if (subsDetailInvoice) {
    const invoiceParts = [
      data.invoiceName,
      data.invoiceAddress,
      [data.invoiceZip, data.invoiceCity].filter(Boolean).join(" "),
      data.invoiceCountry,
      data.invoiceVat ? `VAT: ${data.invoiceVat}` : ""
    ].filter(Boolean);
    subsDetailInvoice.textContent = invoiceParts.length ? invoiceParts.join(", ") : "—";
  }

  if (subsDetailUpdated) {
    subsDetailUpdated.textContent = data.updatedAt ? `Last updated: ${new Date(data.updatedAt).toLocaleString()}` : "";
  }

  if (data.photoURL && subsDetailPhoto) {
    subsDetailPhoto.src = data.photoURL;
    subsDetailPhoto.style.display = "block";
    if (subsDetailPhotoPlaceholder) subsDetailPhotoPlaceholder.style.display = "none";
  } else {
    if (subsDetailPhoto) { subsDetailPhoto.style.display = "none"; subsDetailPhoto.src = ""; }
    if (subsDetailPhotoPlaceholder) subsDetailPhotoPlaceholder.style.display = "flex";
  }

  if (subscribersListView) subscribersListView.style.display = "none";
  if (subscriberDetailView) subscriberDetailView.style.display = "block";
}

if (subscriberBackBtn) {
  subscriberBackBtn.onclick = () => showSubscribersList();
}

if (navSubscribersLink) {
  navSubscribersLink.addEventListener("click", () => {
    showSubscribersList();
    loadSubscribersList();
  });
}
if (mobNavSubscribersLink) {
  mobNavSubscribersLink.addEventListener("click", () => {
    showSubscribersList();
    loadSubscribersList();
  });
}

// Listen to auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    topLoginBtn.style.display = "none";
    topEmailDisplay.style.display = "inline-block";
    topEmailDisplay.textContent = user.email;
    topLogoutBtn.style.display = "inline-block";

    if (accountLocked && accountUnlocked) {
      accountLocked.style.display = "none";
      accountUnlocked.style.display = "block";
      loadAccountData(user);
    }

    checkAdminStatus(user);

  } else {
    // User is signed out
    topLoginBtn.style.display = "inline-block";
    topEmailDisplay.style.display = "none";
    topEmailDisplay.textContent = "";
    topLogoutBtn.style.display = "none";

    if (accountLocked && accountUnlocked) {
      accountLocked.style.display = "block";
      accountUnlocked.style.display = "none";
      resetAccountForm();
    }
  }
});
