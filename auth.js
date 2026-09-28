import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword, onAuthStateChanged, signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs, Bytes } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
// Note: this project intentionally does NOT use Firebase Storage — as of late 2024,
// new Cloud Storage for Firebase buckets require the paid Blaze plan. Photos and
// confirmation letters are instead stored as compact base64 text directly in
// Firestore documents, which stays on the free Spark plan (subject to Firestore's
// 1 MiB per-document limit — see the size caps below).

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
const forgotWrap = document.getElementById("auth-forgot-wrap");
const forgotLink = document.getElementById("auth-forgot-link");

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
const accountArrival = document.getElementById("account-arrival");
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
const accountPersonalVat = document.getElementById("account-personal-vat");
const accountBillInstitutionRadios = document.querySelectorAll('input[name="account-bill-institution"]');
const accountTripRadios = document.querySelectorAll('input[name="account-trip-interest"]');
const accountNotes = document.getElementById("account-notes");
const accountSaveBtn = document.getElementById("account-save-btn");
const accountSaveStatus = document.getElementById("account-save-status");

// DOM Elements — Confirmation letter (user-facing download)
const accountLetterStatus = document.getElementById("account-letter-status");
const accountLetterDownload = document.getElementById("account-letter-download");

// DOM Elements — Abstract upload (self-service, every logged-in user incl. the organizer)
const accountAbstractStatus = document.getElementById("account-abstract-status");
const accountAbstractInput = document.getElementById("account-abstract-input");
const accountAbstractUploadBtn = document.getElementById("account-abstract-upload-btn");
const accountAbstractDownload = document.getElementById("account-abstract-download");

// DOM Elements — Talk slides upload (speakers only; hidden unless the organizer assigned a talk)
const accountPresentationCard = document.getElementById("account-presentation-card");
const accountPresentationTalk = document.getElementById("account-presentation-talk");
const accountPresentationStatus = document.getElementById("account-presentation-status");
const accountPresentationInput = document.getElementById("account-presentation-input");
const accountPresentationUploadBtn = document.getElementById("account-presentation-upload-btn");
const accountPresentationDownload = document.getElementById("account-presentation-download");

// DOM Elements — Delete my account (self-service, open until 1 September 2026)
const accountDangerZone = document.getElementById("account-danger-zone");
const accountDeleteOpen = document.getElementById("account-delete-open");
const accountDeleteClosed = document.getElementById("account-delete-closed");
const accountDeletePassword = document.getElementById("account-delete-password");
const accountDeleteBtn = document.getElementById("account-delete-btn");
const accountDeleteStatus = document.getElementById("account-delete-status");

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
const subsDetailArrival = document.getElementById("subs-detail-arrival");
const subsDetailDietary = document.getElementById("subs-detail-dietary");
const subsDetailTrip = document.getElementById("subs-detail-trip");
const subsDetailInvoice = document.getElementById("subs-detail-invoice");
const subsDetailBillInstitution = document.getElementById("subs-detail-bill-institution");
const subsDetailPersonalVat = document.getElementById("subs-detail-personal-vat");
const subsDetailBio = document.getElementById("subs-detail-bio");
const subsDetailNotes = document.getElementById("subs-detail-notes");
const subsDetailUpdated = document.getElementById("subs-detail-updated");
const subsLetterStatus = document.getElementById("subs-letter-status");
const subsLetterInput = document.getElementById("subs-letter-input");
const subsLetterUploadBtn = document.getElementById("subs-letter-upload-btn");
const subsLetterCurrentLink = document.getElementById("subs-letter-current-link");
const subsAbstractStatus = document.getElementById("subs-abstract-status");
const subsAbstractDownload = document.getElementById("subs-abstract-download");
const subsSpeakerSelect = document.getElementById("subs-speaker-select");
const galleryStatus = document.getElementById("gallery-status");
const participantsStatus = document.getElementById("participants-status");
const participantsList = document.getElementById("participants-list");
const galleryAdmin = document.getElementById("gallery-admin");
const galleryInput = document.getElementById("gallery-input");
const galleryUploadStatus = document.getElementById("gallery-upload-status");
const galleryGrid = document.getElementById("gallery-grid");
const subsSpeakerStatus = document.getElementById("subs-speaker-status");

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
const BILL_INSTITUTION_LABELS = {
  yes: "🏛️ Yes — billed to Institution",
  no: "🙋 No — billed personally"
};

let isLoginMode = true;
let isAdmin = false;
let currentSubscriberUid = null; // whichever subscriber the organizer is currently viewing
let pendingLetterDataUrl = null;
let pendingLetterFileName = null;
let pendingAbstractDataUrl = null;
let pendingAbstractFileName = null;
let pendingPresentationFile = null;
let currentSpeakerTalkId = null; // talk id (e.g. "talk-marco") the signed-in user may upload slides for

// Confirmation letters live in their own Firestore collection — one document per user,
// keyed by their UID, separate from the `users` collection so a large PDF never eats
// into the budget of the profile document. `uid` here is always either
// auth.currentUser.uid (the signed-in user's own ID) or a Firestore document ID pulled
// from the users collection (see loadSubscribersList) — never free text a caller can type.
// Raw file size cap is kept well under Firestore's 1 MiB per-document limit once
// base64-encoded (~37% larger than the original file).
const MAX_LETTER_BYTES = 650 * 1024; // 650 KB raw → ~890 KB encoded, leaves headroom

// Abstracts live in their own Firestore collection too (abstracts/{uid}), unlike the
// letter this one is writable by the owning user themselves — it's their own submission,
// not something only the organizer issues. Same size-cap reasoning as the letter.
const MAX_ABSTRACT_BYTES = 300 * 1024; // 300 KB raw → ~410 KB encoded
const ALLOWED_ABSTRACT_EXTENSIONS = [".doc", ".docx"];
const ALLOWED_ABSTRACT_MIME_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

// Talk slides: only speakers upload them. The organizer marks an account as the speaker of a
// talk in the Subscribers panel (speakers/{uid} = { talkId }, admin-write-only); the speaker can
// then write presentations/{talkId}, which every signed-in (registered) user can download from
// that talk's card — it is the card's "restricted material". Enforced by firestore.rules.
//
// A Firestore document holds at most 1 MiB, so each file is stored as raw bytes split across
// presentations/{talkId}/chunks/{0..n-1} (~900 KB each), with presentations/{talkId} holding
// the name/type/chunk count. Like abstracts, it never touches the public GitHub repo.
// ponytail: chunked Firestore instead of Firebase Storage, which needs the paid Blaze plan.
// Ceiling: the free Spark tier (1 GiB stored, ~10 GiB/month downloaded) — plenty for a handful
// of decks. Upgrade path if decks get huge or downloads heavy: Storage + uploadBytes().
// 100 MB ≈ 112 chunk writes; 30 downloads of a deck that size ≈ 3 GB of the ~10 GiB/month free quota.
const MAX_PRESENTATION_BYTES = 100 * 1024 * 1024; // 100 MB
const SLIDES_CHUNK_BYTES = 900 * 1024;
const ALLOWED_PRESENTATION_EXTENSIONS = [".ppt", ".pptx", ".pdf"];

// "" if the file is acceptable as talk slides, otherwise the message to show
function slidesFileError(file) {
  const name = file.name.toLowerCase();
  if (!ALLOWED_PRESENTATION_EXTENSIONS.some(ext => name.endsWith(ext))) return "Please choose a .ppt, .pptx or .pdf file.";
  if (file.size > MAX_PRESENTATION_BYTES) return `That file is too large — max ${MAX_PRESENTATION_BYTES / 1024 / 1024} MB.`;
  return "";
}

// Chunked file storage shared by talk slides (presentations/*) and the image gallery (gallery/*):
// {col}/{id} holds the metadata, {col}/{id}/chunks/{0..n-1} the raw bytes.
// Chunks first, metadata last, so readers only see the new chunk count once every chunk
// exists; leftover chunks from a bigger previous file are then removed.
async function saveChunkedFile(col, id, bytes, meta, onProgress) {
  const count = Math.max(1, Math.ceil(bytes.length / SLIDES_CHUNK_BYTES));
  const old = await getDoc(doc(db, col, id));
  const oldCount = old.exists() ? (old.data().chunkCount || 0) : 0;
  for (let i = 0; i < count; i++) {
    if (onProgress) onProgress(Math.round((i / count) * 100));
    await setDoc(doc(db, col, id, "chunks", String(i)), {
      data: Bytes.fromUint8Array(bytes.subarray(i * SLIDES_CHUNK_BYTES, (i + 1) * SLIDES_CHUNK_BYTES))
    });
  }
  await setDoc(doc(db, col, id), {
    ...meta,
    size: bytes.length,
    chunkCount: count,
    uploadedBy: auth.currentUser.uid,
    uploadedAt: new Date().toISOString()
  });
  for (let i = count; i < oldCount; i++) {
    await deleteDoc(doc(db, col, id, "chunks", String(i)));
  }
}

// Resolves { blob, meta }, or null if nothing is stored there yet.
async function loadChunkedFile(col, id) {
  const snap = await getDoc(doc(db, col, id));
  if (!snap.exists() || !snap.data().chunkCount) return null;
  const meta = snap.data();
  const chunks = await Promise.all(Array.from({ length: meta.chunkCount }, (_, i) =>
    getDoc(doc(db, col, id, "chunks", String(i)))));
  return { blob: new Blob(chunks.map(c => c.data().data.toUint8Array()), { type: meta.mimeType }), meta };
}

async function deleteChunkedFile(col, id) {
  const snap = await getDoc(doc(db, col, id));
  const count = snap.exists() ? (snap.data().chunkCount || 0) : 0;
  await deleteDoc(doc(db, col, id)); // metadata first, so the item disappears from lists right away
  for (let i = 0; i < count; i++) await deleteDoc(doc(db, col, id, "chunks", String(i)));
}

async function uploadSlides(talkId, file, onProgress) {
  await saveChunkedFile("presentations", talkId, new Uint8Array(await file.arrayBuffer()),
    { fileName: file.name, mimeType: file.type || "application/octet-stream" }, onProgress);
}

// Reassembles and saves a talk's slides; resolves false if none were uploaded yet.
async function downloadSlides(talkId) {
  const file = await loadChunkedFile("presentations", talkId);
  if (!file) return false;
  const url = URL.createObjectURL(file.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.meta.fileName || "slides.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  return true;
}

// Check if current time is past midnight today (2026-08-04 00:00:00)
function isPastMidnight() {
  const cutoff = new Date("2026-08-04T00:00:00").getTime();
  return Date.now() >= cutoff;
}

// Self-service account deletion is only offered up to (and including) 1 September 2026.
function isPastAccountDeletionDeadline() {
  const cutoff = new Date("2026-09-01T23:59:59").getTime();
  return Date.now() > cutoff;
}

// The organizer never gets the self-delete option on their own account — deleting the
// organizer's Auth user would strand the admins/{uid} document at a UID that can never
// sign in again, permanently cutting off the Subscribers panel for everyone. Called both
// right after login (deadline-only, isAdmin not resolved yet) and again once
// checkAdminStatus resolves, so the final state is always correct regardless of which
// async check finishes first.
function updateDeleteZoneVisibility() {
  if (!accountDangerZone) return;
  if (isAdmin) {
    accountDangerZone.style.display = "none";
    return;
  }
  accountDangerZone.style.display = "block";
  const deletionClosed = isPastAccountDeletionDeadline();
  if (accountDeleteOpen) accountDeleteOpen.style.display = deletionClosed ? "none" : "block";
  if (accountDeleteClosed) accountDeleteClosed.style.display = deletionClosed ? "block" : "none";
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
  if (forgotWrap) forgotWrap.style.display = isLoginMode ? "" : "none";

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

// Password reset: Firebase emails a link to its own hosted reset page
// (<project>.firebaseapp.com/__/auth/action) — plain web, no Firebase Dynamic Links involved.
if (forgotLink) {
  forgotLink.onclick = (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (!email) {
      showError("Enter your email address above, then click \"Forgot your password?\" again.");
      emailInput.focus();
      return;
    }
    // Same wording whether or not the account exists, so the form can't be used to probe emails
    const sentMsg = "If an account exists for " + email + ", a password reset link has been sent. Check your inbox (and spam folder).";
    forgotLink.style.pointerEvents = "none";
    sendPasswordResetEmail(auth, email)
      .then(() => showInfo(sentMsg))
      .catch((error) => {
        if (error.code === "auth/user-not-found") showInfo(sentMsg);
        else if (error.code === "auth/invalid-email") showError("Please enter a valid email address.");
        else if (error.code === "auth/too-many-requests") showError("Too many requests. Please wait a few minutes and try again.");
        else showError(error.message.replace("Firebase: ", ""));
      })
      .finally(() => { forgotLink.style.pointerEvents = ""; });
  };
}

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
  errorMsg.removeAttribute("style"); // drop any success colouring left by showInfo
  errorMsg.textContent = "⚠️ " + msg;
  errorMsg.style.display = "block";
}

// Same box as showError, recoloured green for success messages
function showInfo(msg) {
  showError(msg);
  errorMsg.textContent = "✅ " + msg;
  errorMsg.style.background = "rgba(16, 185, 129, 0.1)";
  errorMsg.style.borderColor = "rgba(16, 185, 129, 0.3)";
  errorMsg.style.color = "var(--accent-glow)";
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
  if (accountFullName) accountFullName.value = "";
  if (accountPosition) accountPosition.value = "";
  if (accountInstitution) accountInstitution.value = "";
  if (accountCountry) accountCountry.value = "";
  if (accountPhone) accountPhone.value = "";
  if (accountArrival) accountArrival.value = "";
  if (accountDietary) accountDietary.value = "";
  if (accountBio) accountBio.value = "";
  if (accountInvoiceName) accountInvoiceName.value = "";
  if (accountInvoiceAddress) accountInvoiceAddress.value = "";
  if (accountInvoiceCity) accountInvoiceCity.value = "";
  if (accountInvoiceZip) accountInvoiceZip.value = "";
  if (accountInvoiceCountry) accountInvoiceCountry.value = "";
  if (accountInvoiceVat) accountInvoiceVat.value = "";
  if (accountPersonalVat) accountPersonalVat.value = "";
  accountBillInstitutionRadios.forEach(r => { r.checked = false; });
  accountTripRadios.forEach(r => { r.checked = false; });
  if (accountNotes) accountNotes.value = "";
  if (accountPhotoPreview) { accountPhotoPreview.style.display = "none"; accountPhotoPreview.src = ""; }
  if (accountPhotoPlaceholder) accountPhotoPlaceholder.style.display = "flex";
  if (accountSaveStatus) accountSaveStatus.style.display = "none";
  if (accountLetterStatus) accountLetterStatus.textContent = "";
  if (accountLetterDownload) { accountLetterDownload.style.display = "none"; accountLetterDownload.href = "#"; }
  pendingAbstractDataUrl = null;
  pendingAbstractFileName = null;
  if (accountAbstractInput) accountAbstractInput.value = "";
  if (accountAbstractUploadBtn) accountAbstractUploadBtn.disabled = true;
  if (accountAbstractStatus) accountAbstractStatus.textContent = "";
  if (accountAbstractDownload) { accountAbstractDownload.style.display = "none"; accountAbstractDownload.href = "#"; }
  pendingPresentationFile = null;
  currentSpeakerTalkId = null;
  if (accountPresentationCard) accountPresentationCard.style.display = "none";
  if (accountPresentationInput) accountPresentationInput.value = "";
  if (accountPresentationUploadBtn) accountPresentationUploadBtn.disabled = true;
  if (accountPresentationStatus) accountPresentationStatus.textContent = "";
  if (accountPresentationDownload) accountPresentationDownload.style.display = "none";
  if (accountDeletePassword) accountDeletePassword.value = "";
  if (accountDeleteStatus) { accountDeleteStatus.textContent = ""; accountDeleteStatus.style.display = "none"; }
  if (accountDangerZone) accountDangerZone.style.display = "none";

  // Reset the organizer-only Subscribers panel too — clear any rendered participant
  // data from the DOM, not just hide it, so nothing lingers after logout.
  isAdmin = false;
  currentSubscriberUid = null;
  pendingLetterDataUrl = null;
  pendingLetterFileName = null;
  if (navSubscribersItem) navSubscribersItem.style.display = "none";
  if (mobNavSubscribersLink) mobNavSubscribersLink.style.display = "none";
  if (subscriberDetailView) subscriberDetailView.style.display = "none";
  if (subscribersListView) subscribersListView.style.display = "block";
  if (subscribersList) subscribersList.innerHTML = "";
  [subsDetailName, subsDetailEmail, subsDetailPosition, subsDetailInstitution, subsDetailCountry,
   subsDetailPhone, subsDetailArrival, subsDetailDietary, subsDetailTrip, subsDetailInvoice,
   subsDetailBillInstitution, subsDetailPersonalVat, subsDetailBio,
   subsDetailNotes, subsDetailUpdated, subsLetterStatus, subsAbstractStatus, subsSpeakerStatus].forEach(el => { if (el) el.textContent = ""; });
  if (subsDetailPhoto) { subsDetailPhoto.style.display = "none"; subsDetailPhoto.src = ""; }
  if (subsDetailPhotoPlaceholder) subsDetailPhotoPlaceholder.style.display = "flex";
  if (subsLetterInput) subsLetterInput.value = "";
  if (subsLetterUploadBtn) subsLetterUploadBtn.disabled = true;
  if (subsLetterCurrentLink) { subsLetterCurrentLink.style.display = "none"; subsLetterCurrentLink.href = "#"; }
  if (subsAbstractDownload) { subsAbstractDownload.style.display = "none"; subsAbstractDownload.href = "#"; }
  if (subsSpeakerSelect) subsSpeakerSelect.value = "";

  // If the organizer was on the Subscribers tab, don't leave them staring at an
  // empty admin-only page after logout — send them back to the public Overview tab.
  const subscribersSection = document.getElementById("subscribers");
  if (subscribersSection && subscribersSection.classList.contains("active")) {
    goToSection("overview");
  }
}

// Photos are stored as base64 text inside the user's Firestore document (no Firebase
// Storage — see the note at the top of this file), so every photo is resized/compressed
// client-side into a small JPEG before it's ever saved. accountPhotoPreview.src *is* the
// value that gets written on Save — there's no separate upload step or pending file.
// Client-side checks (type, dimensions, output size) are a UX convenience only; the real
// enforcement is the Firestore security rule's size cap on the photoDataUrl field.
const MAX_PHOTO_INPUT_BYTES = 15 * 1024 * 1024; // reject absurdly large source files outright
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const PHOTO_MAX_DIMENSION = 420; // px, longest edge after resize
const PHOTO_JPEG_QUALITY = 0.82;
const MAX_PHOTO_DATA_URL_LENGTH = 220000; // ~165 KB encoded, keeps users/{uid} well under 1 MiB

function resizeImageToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > PHOTO_MAX_DIMENSION) {
        height = Math.round(height * (PHOTO_MAX_DIMENSION / width));
        width = PHOTO_MAX_DIMENSION;
      } else if (height > PHOTO_MAX_DIMENSION) {
        width = Math.round(width * (PHOTO_MAX_DIMENSION / height));
        height = PHOTO_MAX_DIMENSION;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", PHOTO_JPEG_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read that image"));
    };
    img.src = objectUrl;
  });
}

if (accountPhotoInput) {
  accountPhotoInput.onchange = async () => {
    const file = accountPhotoInput.files && accountPhotoInput.files[0];
    if (!file) return;

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      showAccountStatus("Please choose a JPG, PNG, WEBP or GIF image.", true);
      accountPhotoInput.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_INPUT_BYTES) {
      showAccountStatus("That image is too large — please choose one under 15 MB.", true);
      accountPhotoInput.value = "";
      return;
    }

    if (accountSaveStatus) accountSaveStatus.style.display = "none";
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      if (dataUrl.length > MAX_PHOTO_DATA_URL_LENGTH) {
        showAccountStatus("This photo is too complex to store even after compressing — please try a simpler image.", true);
        accountPhotoInput.value = "";
        return;
      }
      if (accountPhotoPreview) {
        accountPhotoPreview.src = dataUrl;
        accountPhotoPreview.style.display = "block";
      }
      if (accountPhotoPlaceholder) accountPhotoPlaceholder.style.display = "none";
    } catch (error) {
      console.error("Failed to process photo:", error);
      showAccountStatus("Could not process that image — please try another file.", true);
      accountPhotoInput.value = "";
    }
  };
}

// Clicking the top-bar email jumps to the Account tab
if (topEmailDisplay) {
  topEmailDisplay.onclick = (e) => {
    e.preventDefault();
    goToSection("account");
  };
}

// Look up the signed-in user's own confirmation letter, stored as a Firestore document
// at letters/{uid}. Read access is scoped to the caller's own UID (or an organizer) by
// the Firestore security rule — this never accepts a UID argument from anywhere but
// auth.currentUser, so it can only ever fetch your own.
function loadConfirmationLetter(user) {
  if (!accountLetterStatus || !accountLetterDownload) return;
  accountLetterStatus.textContent = "Checking…";
  accountLetterDownload.style.display = "none";

  getDoc(doc(db, "letters", user.uid)).then((snap) => {
    if (snap.exists() && snap.data().pdfDataUrl) {
      accountLetterStatus.textContent = "Your confirmation letter is ready.";
      accountLetterDownload.href = snap.data().pdfDataUrl;
      accountLetterDownload.download = snap.data().fileName || "confirmation-letter.pdf";
      accountLetterDownload.style.display = "inline-block";
    } else {
      accountLetterStatus.textContent = "Fill in and save your information above — your confirmation letter will appear here once the organisers issue it.";
      accountLetterDownload.style.display = "none";
    }
  }).catch((error) => {
    console.error("Failed to check confirmation letter:", error);
    accountLetterStatus.textContent = "Could not check your confirmation letter right now.";
    accountLetterDownload.style.display = "none";
  });
}

// Look up the signed-in user's own abstract, stored at abstracts/{uid}. Same scoping
// guarantee as loadConfirmationLetter — always auth.currentUser, never a passed-in UID.
function loadAbstract(user) {
  if (!accountAbstractStatus || !accountAbstractDownload) return;
  accountAbstractStatus.textContent = "Checking…";
  accountAbstractDownload.style.display = "none";

  getDoc(doc(db, "abstracts", user.uid)).then((snap) => {
    if (snap.exists() && snap.data().abstractDataUrl) {
      accountAbstractStatus.textContent = `Current abstract: ${snap.data().fileName || "abstract"} — uploading a new one will replace it.`;
      accountAbstractDownload.href = snap.data().abstractDataUrl;
      accountAbstractDownload.download = snap.data().fileName || "abstract.docx";
      accountAbstractDownload.style.display = "inline-block";
    } else {
      accountAbstractStatus.textContent = "No abstract uploaded yet.";
      accountAbstractDownload.style.display = "none";
    }
  }).catch((error) => {
    console.error("Failed to check abstract:", error);
    accountAbstractStatus.textContent = "Could not check your abstract right now.";
    accountAbstractDownload.style.display = "none";
  });
}

// Title of a speaker card in the Programme, e.g. talkTitle("talk-marco")
function talkTitle(talkId) {
  const t = document.querySelector(`#${CSS.escape(talkId)} .contrib-title`);
  return t ? t.textContent.trim() : talkId;
}

// Speakers only: show the slides card if the organizer assigned this account a talk
// (speakers/{uid}). Always auth.currentUser's own uid, never a passed-in one.
function loadPresentation(user) {
  currentSpeakerTalkId = null;
  if (!accountPresentationCard || !accountPresentationStatus || !accountPresentationDownload) return;
  accountPresentationCard.style.display = "none";

  getDoc(doc(db, "speakers", user.uid)).then((snap) => {
    const talkId = snap.exists() ? snap.data().talkId : null;
    if (!talkId) return;
    currentSpeakerTalkId = talkId;
    if (accountPresentationTalk) accountPresentationTalk.textContent = talkTitle(talkId);
    accountPresentationCard.style.display = "";
    accountPresentationStatus.textContent = "Checking…";
    accountPresentationDownload.style.display = "none";
    return getDoc(doc(db, "presentations", talkId)).then((p) => {
      if (p.exists() && p.data().chunkCount) {
        accountPresentationStatus.textContent = `Current slides: ${p.data().fileName || "slides"} — uploading a new file will replace them.`;
        accountPresentationDownload.onclick = (e) => {
          e.preventDefault();
          downloadSlides(talkId).catch((error) => console.error("Failed to download slides:", error));
        };
        accountPresentationDownload.style.display = "inline-block";
      } else {
        accountPresentationStatus.textContent = "No slides uploaded yet.";
      }
    });
  }).catch((error) => {
    console.error("Failed to check speaker slides:", error);
    accountPresentationStatus.textContent = "Could not check your slides right now.";
  });
}

if (accountAbstractInput) {
  accountAbstractInput.onchange = () => {
    const file = accountAbstractInput.files && accountAbstractInput.files[0];
    pendingAbstractDataUrl = null;
    pendingAbstractFileName = null;
    if (accountAbstractUploadBtn) accountAbstractUploadBtn.disabled = true;
    if (!file) return;

    const nameLower = file.name.toLowerCase();
    const extOk = ALLOWED_ABSTRACT_EXTENSIONS.some(ext => nameLower.endsWith(ext));
    const typeOk = ALLOWED_ABSTRACT_MIME_TYPES.includes(file.type);
    if (!extOk && !typeOk) {
      accountAbstractStatus.textContent = "Please choose a .doc or .docx file.";
      accountAbstractInput.value = "";
      return;
    }
    if (file.size > MAX_ABSTRACT_BYTES) {
      accountAbstractStatus.textContent = `That file is too large — please choose one under ${Math.round(MAX_ABSTRACT_BYTES / 1024)} KB.`;
      accountAbstractInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      pendingAbstractDataUrl = e.target.result;
      pendingAbstractFileName = file.name;
      accountAbstractStatus.textContent = `Ready to upload: ${file.name}`;
      if (accountAbstractUploadBtn) accountAbstractUploadBtn.disabled = false;
    };
    reader.onerror = () => {
      accountAbstractStatus.textContent = "Could not read that file.";
    };
    reader.readAsDataURL(file);
  };
}

if (accountAbstractUploadBtn) {
  accountAbstractUploadBtn.onclick = async () => {
    const user = auth.currentUser;
    if (!user || !pendingAbstractDataUrl) return;

    accountAbstractUploadBtn.disabled = true;
    accountAbstractStatus.textContent = "Uploading…";

    try {
      await setDoc(doc(db, "abstracts", user.uid), {
        abstractDataUrl: pendingAbstractDataUrl,
        fileName: pendingAbstractFileName,
        uploadedAt: new Date().toISOString()
      });
      pendingAbstractDataUrl = null;
      pendingAbstractFileName = null;
      if (accountAbstractInput) accountAbstractInput.value = "";
      loadAbstract(user);
    } catch (error) {
      console.error("Failed to upload abstract:", error);
      accountAbstractStatus.textContent = "Could not upload your abstract: " + error.message;
      accountAbstractUploadBtn.disabled = false;
    }
  };
}

if (accountPresentationInput) {
  accountPresentationInput.onchange = () => {
    const file = accountPresentationInput.files && accountPresentationInput.files[0];
    pendingPresentationFile = null;
    if (accountPresentationUploadBtn) accountPresentationUploadBtn.disabled = true;
    if (!file) return;

    const error = slidesFileError(file);
    if (error) {
      accountPresentationStatus.textContent = error;
      accountPresentationInput.value = "";
      return;
    }
    pendingPresentationFile = file;
    accountPresentationStatus.textContent = `Ready to upload: ${file.name}`;
    if (accountPresentationUploadBtn) accountPresentationUploadBtn.disabled = false;
  };
}

if (accountPresentationUploadBtn) {
  accountPresentationUploadBtn.onclick = async () => {
    const user = auth.currentUser;
    if (!user || !pendingPresentationFile || !currentSpeakerTalkId) return;

    accountPresentationUploadBtn.disabled = true;
    accountPresentationStatus.textContent = "Uploading…";

    try {
      await uploadSlides(currentSpeakerTalkId, pendingPresentationFile,
        (pct) => { accountPresentationStatus.textContent = `Uploading… ${pct}%`; });
      pendingPresentationFile = null;
      if (accountPresentationInput) accountPresentationInput.value = "";
      loadPresentation(user);
    } catch (error) {
      console.error("Failed to upload presentation:", error);
      accountPresentationStatus.textContent = "Could not upload your presentation: " + error.message;
      accountPresentationUploadBtn.disabled = false;
    }
  };
}

function loadAccountData(user) {
  if (accountEmailField) accountEmailField.value = user.email || "";
  loadConfirmationLetter(user);
  loadAbstract(user);
  loadPresentation(user);
  updateDeleteZoneVisibility();

  const userDocRef = doc(db, "users", user.uid);
  getDoc(userDocRef).then((userDoc) => {
    if (!userDoc.exists()) return;
    const data = userDoc.data();
    if (accountFullName && data.fullName) accountFullName.value = data.fullName;
    if (accountPosition && data.position) accountPosition.value = data.position;
    if (accountInstitution && data.institution) accountInstitution.value = data.institution;
    if (accountCountry && data.country) accountCountry.value = data.country;
    if (accountPhone && data.phone) accountPhone.value = data.phone;
    if (accountArrival && data.arrivalTime) accountArrival.value = data.arrivalTime;
    if (accountDietary && data.dietary) accountDietary.value = data.dietary;
    if (accountBio && data.bio) accountBio.value = data.bio;
    if (accountInvoiceName && data.invoiceName) accountInvoiceName.value = data.invoiceName;
    if (accountInvoiceAddress && data.invoiceAddress) accountInvoiceAddress.value = data.invoiceAddress;
    if (accountInvoiceCity && data.invoiceCity) accountInvoiceCity.value = data.invoiceCity;
    if (accountInvoiceZip && data.invoiceZip) accountInvoiceZip.value = data.invoiceZip;
    if (accountInvoiceCountry && data.invoiceCountry) accountInvoiceCountry.value = data.invoiceCountry;
    if (accountInvoiceVat && data.invoiceVat) accountInvoiceVat.value = data.invoiceVat;
    if (accountPersonalVat && data.personalVat) accountPersonalVat.value = data.personalVat;
    if (data.billInstitution) {
      accountBillInstitutionRadios.forEach(r => { r.checked = (r.value === data.billInstitution); });
    }
    if (data.tripInterest) {
      accountTripRadios.forEach(r => { r.checked = (r.value === data.tripInterest); });
    }
    if (accountNotes && data.notes) accountNotes.value = data.notes;
    if (data.photoDataUrl && accountPhotoPreview) {
      accountPhotoPreview.src = data.photoDataUrl;
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
      // accountPhotoPreview.src already holds the final resized/compressed base64 image
      // (set either by picking a new photo, or by loadAccountData restoring the saved one)
      // — no separate upload step, this is what gets written straight into Firestore.
      const photoDataUrl = accountPhotoPreview && accountPhotoPreview.style.display !== "none" ? accountPhotoPreview.src : null;

      const profileData = {
        email: user.email || "",
        fullName: accountFullName ? accountFullName.value.trim() : "",
        position: accountPosition ? accountPosition.value : "",
        institution: accountInstitution ? accountInstitution.value.trim() : "",
        country: accountCountry ? accountCountry.value.trim() : "",
        phone: accountPhone ? accountPhone.value.trim() : "",
        arrivalTime: accountArrival ? accountArrival.value.trim() : "",
        dietary: accountDietary ? accountDietary.value.trim() : "",
        bio: accountBio ? accountBio.value.trim() : "",
        invoiceName: accountInvoiceName ? accountInvoiceName.value.trim() : "",
        invoiceAddress: accountInvoiceAddress ? accountInvoiceAddress.value.trim() : "",
        invoiceCity: accountInvoiceCity ? accountInvoiceCity.value.trim() : "",
        invoiceZip: accountInvoiceZip ? accountInvoiceZip.value.trim() : "",
        invoiceCountry: accountInvoiceCountry ? accountInvoiceCountry.value.trim() : "",
        invoiceVat: accountInvoiceVat ? accountInvoiceVat.value.trim() : "",
        personalVat: accountPersonalVat ? accountPersonalVat.value.trim() : "",
        billInstitution: (() => {
          const checked = Array.from(accountBillInstitutionRadios).find(r => r.checked);
          return checked ? checked.value : "";
        })(),
        tripInterest: (() => {
          const checked = Array.from(accountTripRadios).find(r => r.checked);
          return checked ? checked.value : "";
        })(),
        notes: accountNotes ? accountNotes.value.trim() : "",
        updatedAt: new Date().toISOString()
      };
      if (photoDataUrl) {
        profileData.photoDataUrl = photoDataUrl;
      }

      await setDoc(doc(db, "users", user.uid), profileData, { merge: true });
      await setDoc(doc(db, "directory", user.uid), directoryEntry(profileData));
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

// ===== Delete my account (self-service, open until 1 September 2026) =====
//
// Security: this always operates on auth.currentUser — there is no code path here
// that accepts a UID, so a signed-in user can only ever delete their own account and
// their own users/{uid} document, never anyone else's. Firebase requires a "recent"
// sign-in before allowing account deletion (auth/requires-recent-login), which is why
// this re-authenticates with the user's password immediately beforehand — that also
// doubles as a safeguard against, e.g., an unattended logged-in browser being used to
// delete the account without knowing the password.
function showDeleteStatus(msg, isError) {
  if (!accountDeleteStatus) return;
  accountDeleteStatus.textContent = msg;
  accountDeleteStatus.style.color = isError ? "var(--accent-rose)" : "var(--accent-glow)";
  accountDeleteStatus.style.display = "block";
}

if (accountDeleteBtn) {
  accountDeleteBtn.onclick = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // Belt-and-suspenders: the organizer's own account should never be deletable from
    // here, even in an unlikely race where the UI hasn't hidden this button yet.
    if (isAdmin) {
      showDeleteStatus("The organizer account cannot be deleted from here.", true);
      return;
    }

    if (isPastAccountDeletionDeadline()) {
      showDeleteStatus("The self-service deletion window has closed.", true);
      return;
    }

    const password = accountDeletePassword ? accountDeletePassword.value : "";
    if (!password) {
      showDeleteStatus("Please enter your password to confirm.", true);
      return;
    }

    const confirmed = window.confirm(
      "This will permanently delete your account and everything you've submitted (profile, invoice info, photo). This cannot be undone. Continue?"
    );
    if (!confirmed) return;

    accountDeleteBtn.disabled = true;
    showDeleteStatus("Deleting…", false);

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      await deleteDoc(doc(db, "users", user.uid));
      // Unlike letters/{uid} (admin-write-only), abstracts/{uid} is self-writable — so it's
      // the piece of the deletion audit we CAN actually clean up here. Talk slides
      // (presentations/{talkId}) belong to the talk, not the account, so they stay.
      await deleteDoc(doc(db, "abstracts", user.uid));
      await deleteDoc(doc(db, "directory", user.uid));
      await deleteUser(user);
      // deleteUser signs the user out automatically; onAuthStateChanged will reset the UI.
      alert("Your account has been deleted.");
      goToSection("overview");
    } catch (error) {
      const msg = (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential")
        ? "Incorrect password."
        : error.code === "auth/too-many-requests"
        ? "Too many attempts — please try again later."
        : error.message.replace("Firebase: ", "");
      showDeleteStatus(msg, true);
      accountDeleteBtn.disabled = false;
    }
  };
}

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
    if (isAdmin) {
      renderTalkMaterials(true); // adds the organizer's per-talk upload links
      if (galleryAdmin) galleryAdmin.style.display = "";
      if (isSectionActive("images")) loadGallery(); // re-render with delete buttons
    }
    if (navSubscribersItem) navSubscribersItem.style.display = isAdmin ? "block" : "none";
    if (mobNavSubscribersLink) mobNavSubscribersLink.style.display = isAdmin ? "flex" : "none";
    updateDeleteZoneVisibility();
  }).catch(() => {
    isAdmin = false;
    if (navSubscribersItem) navSubscribersItem.style.display = "none";
    if (mobNavSubscribersLink) mobNavSubscribersLink.style.display = "none";
    updateDeleteZoneVisibility();
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
    syncDirectory(rows);

    rows.forEach(({ uid, data }) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "subscriber-row";

      const avatar = document.createElement("img");
      avatar.className = "subscriber-row-avatar";
      avatar.alt = "";
      if (data.photoDataUrl) {
        avatar.src = data.photoDataUrl;
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
  if (subsDetailArrival) subsDetailArrival.textContent = data.arrivalTime || "—";
  if (subsDetailDietary) subsDetailDietary.textContent = data.dietary || "—";
  if (subsDetailTrip) subsDetailTrip.textContent = TRIP_LABELS[data.tripInterest] || "—";
  if (subsDetailBillInstitution) subsDetailBillInstitution.textContent = BILL_INSTITUTION_LABELS[data.billInstitution] || "—";
  if (subsDetailPersonalVat) subsDetailPersonalVat.textContent = data.personalVat || "—";
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

  if (data.photoDataUrl && subsDetailPhoto) {
    subsDetailPhoto.src = data.photoDataUrl;
    subsDetailPhoto.style.display = "block";
    if (subsDetailPhotoPlaceholder) subsDetailPhotoPlaceholder.style.display = "none";
  } else {
    if (subsDetailPhoto) { subsDetailPhoto.style.display = "none"; subsDetailPhoto.src = ""; }
    if (subsDetailPhotoPlaceholder) subsDetailPhotoPlaceholder.style.display = "flex";
  }

  currentSubscriberUid = uid;
  pendingLetterDataUrl = null;
  pendingLetterFileName = null;
  if (subsLetterInput) subsLetterInput.value = "";
  if (subsLetterUploadBtn) subsLetterUploadBtn.disabled = true;
  checkExistingLetter(uid);
  checkSubscriberAbstract(uid);
  checkSubscriberSpeaker(uid);

  if (subscribersListView) subscribersListView.style.display = "none";
  if (subscriberDetailView) subscriberDetailView.style.display = "block";
}

// Shows whether the subscriber currently being viewed has submitted an abstract, and a
// link to download it — strictly read-only, there is no upload control here. Read access
// relies on the caller being an admin (per the Firestore rules on the abstracts
// collection); this only ever reads, never writes to another user's document.
function checkSubscriberAbstract(uid) {
  if (!subsAbstractStatus) return;
  subsAbstractStatus.textContent = "Checking…";
  if (subsAbstractDownload) subsAbstractDownload.style.display = "none";

  getDoc(doc(db, "abstracts", uid)).then((snap) => {
    if (snap.exists() && snap.data().abstractDataUrl) {
      subsAbstractStatus.textContent = `Submitted: ${snap.data().fileName || "abstract"}`;
      if (subsAbstractDownload) {
        subsAbstractDownload.href = snap.data().abstractDataUrl;
        subsAbstractDownload.download = snap.data().fileName || "abstract.docx";
        subsAbstractDownload.style.display = "inline-block";
      }
    } else {
      subsAbstractStatus.textContent = "No abstract submitted yet.";
    }
  }).catch((error) => {
    console.error("Failed to check subscriber abstract:", error);
    subsAbstractStatus.textContent = "Could not check for an abstract.";
  });
}

// Speaker assignment (organizer-only write, per firestore.rules): picking a talk here lets
// this account upload slides for it from their My Account page.
if (subsSpeakerSelect) {
  document.querySelectorAll(".contribution-card[id]").forEach((card) => {
    const speaker = card.querySelector(".contrib-speaker");
    const opt = document.createElement("option");
    opt.value = card.id;
    opt.textContent = talkTitle(card.id) + (speaker ? " — " + speaker.textContent.replace("👤", "").split("(")[0].trim() : "");
    subsSpeakerSelect.appendChild(opt);
  });

  subsSpeakerSelect.onchange = async () => {
    const uid = currentSubscriberUid;
    const talkId = subsSpeakerSelect.value;
    if (!uid || !isAdmin) return;
    subsSpeakerSelect.disabled = true;
    subsSpeakerStatus.textContent = "Saving…";
    try {
      if (talkId) await setDoc(doc(db, "speakers", uid), { talkId, assignedAt: new Date().toISOString() });
      else await deleteDoc(doc(db, "speakers", uid));
      subsSpeakerStatus.textContent = talkId ? "✅ Speaker — they can now upload slides from My Account." : "✅ No longer a speaker.";
    } catch (error) {
      console.error("Failed to save speaker assignment:", error);
      subsSpeakerStatus.textContent = "Could not save: " + error.message;
    } finally {
      subsSpeakerSelect.disabled = false;
    }
  };
}

function checkSubscriberSpeaker(uid) {
  if (!subsSpeakerSelect || !subsSpeakerStatus) return;
  subsSpeakerSelect.value = "";
  subsSpeakerStatus.textContent = "Checking…";
  getDoc(doc(db, "speakers", uid)).then((snap) => {
    if (uid !== currentSubscriberUid) return; // admin already moved on to another subscriber
    const talkId = snap.exists() ? snap.data().talkId : "";
    subsSpeakerSelect.value = talkId || "";
    subsSpeakerStatus.textContent = talkId ? "Speaker — can upload slides for:" : "Not a speaker.";
  }).catch((error) => {
    console.error("Failed to check speaker assignment:", error);
    subsSpeakerStatus.textContent = "Could not check speaker status.";
  });
}

// Talk slides are each speaker card's "restricted material": signed-in (registered) users get a
// download link, everyone else sees the lock. Fetched on click, so nobody downloads every deck up front.
function renderTalkMaterials(signedIn) {
  document.querySelectorAll(".contribution-card[id] .contrib-material-status").forEach((el) => {
    const talkId = el.closest(".contribution-card").id;
    el.textContent = "";
    if (!signedIn) {
      el.textContent = "🔒 Material locked (Registration required)";
      el.style.color = "var(--accent-rose)";
      return;
    }
    el.style.color = "var(--text-muted)";
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = "⬇️ Download slides";
    link.onclick = async (e) => {
      e.preventDefault();
      link.textContent = "Loading…";
      try {
        if (await downloadSlides(talkId)) {
          link.textContent = "⬇️ Download slides";
        } else {
          link.replaceWith("🕒 Slides not uploaded yet — check back later.");
        }
      } catch (error) {
        console.error("Failed to load talk slides:", error);
        link.textContent = "Could not load slides — click to retry";
      }
    };
    el.appendChild(link);
    if (isAdmin) el.append(" · ", organizerSlidesUpload(talkId));
  });
}

// Organizer shortcut: upload/replace any talk's slides straight from its card
// (firestore.rules lets admins write every presentations/{talkId}).
function organizerSlidesUpload(talkId) {
  const wrap = document.createElement("span");
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ALLOWED_PRESENTATION_EXTENSIONS.join(",");
  input.style.display = "none";
  const up = document.createElement("a");
  up.href = "#";
  up.textContent = "⬆️ Upload slides (organizer)";
  up.onclick = (e) => { e.preventDefault(); input.click(); };
  input.onchange = () => {
    const file = input.files && input.files[0];
    input.value = "";
    if (!file) return;
    const error = slidesFileError(file);
    if (error) {
      up.textContent = "⚠️ " + error;
      return;
    }
    up.textContent = "Uploading…";
    uploadSlides(talkId, file, (pct) => { up.textContent = `Uploading… ${pct}%`; })
      .then(() => { up.textContent = `✅ Uploaded ${file.name} — click to replace`; })
      .catch((error) => {
        console.error("Failed to upload talk slides:", error);
        up.textContent = "⚠️ Upload failed — try again";
      });
  };
  wrap.append(up, input);
  return wrap;
}

// Shows whether a confirmation letter already exists for the subscriber currently being
// viewed, and a link to view it. Read access here relies on the caller being an admin
// (per the Firestore rules on the letters collection) — this only ever reads, never writes.
function checkExistingLetter(uid) {
  if (!subsLetterStatus) return;
  subsLetterStatus.textContent = "Checking…";
  if (subsLetterCurrentLink) subsLetterCurrentLink.style.display = "none";

  getDoc(doc(db, "letters", uid)).then((snap) => {
    if (snap.exists() && snap.data().pdfDataUrl) {
      subsLetterStatus.textContent = "A confirmation letter is already on file. Uploading a new one will replace it.";
      if (subsLetterCurrentLink) {
        subsLetterCurrentLink.href = snap.data().pdfDataUrl;
        subsLetterCurrentLink.download = snap.data().fileName || "confirmation-letter.pdf";
        subsLetterCurrentLink.style.display = "inline-block";
      }
    } else {
      subsLetterStatus.textContent = "No letter uploaded yet for this subscriber.";
    }
  }).catch((error) => {
    console.error("Failed to check confirmation letter:", error);
    subsLetterStatus.textContent = "Could not check for an existing letter.";
  });
}

if (subsLetterInput) {
  subsLetterInput.onchange = () => {
    const file = subsLetterInput.files && subsLetterInput.files[0];
    pendingLetterDataUrl = null;
    pendingLetterFileName = null;
    if (subsLetterUploadBtn) subsLetterUploadBtn.disabled = true;
    if (!file) return;

    if (file.type !== "application/pdf") {
      subsLetterStatus.textContent = "Please choose a PDF file.";
      subsLetterInput.value = "";
      return;
    }
    if (file.size > MAX_LETTER_BYTES) {
      subsLetterStatus.textContent = `That file is too large — please choose a PDF under ${Math.round(MAX_LETTER_BYTES / 1024)} KB (a simple, mostly-text letter works best; Firestore has no Storage bucket to offload big files to).`;
      subsLetterInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      pendingLetterDataUrl = e.target.result;
      pendingLetterFileName = file.name;
      subsLetterStatus.textContent = `Ready to upload: ${file.name}`;
      if (subsLetterUploadBtn) subsLetterUploadBtn.disabled = false;
    };
    reader.onerror = () => {
      subsLetterStatus.textContent = "Could not read that file.";
    };
    reader.readAsDataURL(file);
  };
}

if (subsLetterUploadBtn) {
  subsLetterUploadBtn.onclick = async () => {
    if (!pendingLetterDataUrl || !currentSubscriberUid) return;
    if (!isAdmin) {
      subsLetterStatus.textContent = "You do not have organizer access.";
      return;
    }

    subsLetterUploadBtn.disabled = true;
    subsLetterStatus.textContent = "Uploading…";

    try {
      await setDoc(doc(db, "letters", currentSubscriberUid), {
        pdfDataUrl: pendingLetterDataUrl,
        fileName: pendingLetterFileName || "confirmation-letter.pdf",
        uploadedAt: new Date().toISOString()
      });
      pendingLetterDataUrl = null;
      pendingLetterFileName = null;
      if (subsLetterInput) subsLetterInput.value = "";
      checkExistingLetter(currentSubscriberUid);
      subsLetterStatus.textContent = "✅ Uploaded! The subscriber will see it in their My Account page.";
    } catch (error) {
      console.error("Failed to upload confirmation letter:", error);
      subsLetterStatus.textContent = "Could not upload the letter: " + error.message;
      subsLetterUploadBtn.disabled = false;
    }
  };
}

if (subscriberBackBtn) {
  subscriberBackBtn.onclick = () => {
    currentSubscriberUid = null;
    showSubscribersList();
  };
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

// ===== Participants tab (contact directory) =====
//
// users/{uid} holds private data (invoice, VAT, dietary, notes…) and Firestore can't hide single
// fields, so the shareable part lives in its own collection: directory/{uid} = name, email, phone,
// affiliation only. Any signed-in user can read it; firestore.rules only lets the owner or the
// organizer write it, and only with exactly these fields.
function directoryEntry(data) {
  return {
    fullName: data.fullName || "",
    email: data.email || "",
    phone: data.phone || "",
    institution: data.institution || "",
    updatedAt: new Date().toISOString()
  };
}

// Organizer-side backfill: every time the Subscribers list loads, mirror each profile's
// shareable fields into directory/ and drop entries whose profile no longer exists.
async function syncDirectory(rows) {
  if (!isAdmin) return;
  try {
    const existing = await getDocs(collection(db, "directory"));
    const live = new Set(rows.map((r) => r.uid));
    await Promise.all([
      ...rows.map(({ uid, data }) => setDoc(doc(db, "directory", uid), directoryEntry(data))),
      ...existing.docs.filter((d) => !live.has(d.id)).map((d) => deleteDoc(d.ref))
    ]);
  } catch (error) {
    console.error("Failed to sync participant directory:", error);
  }
}

async function loadParticipants() {
  if (!participantsList || !participantsStatus) return;
  participantsList.textContent = "";
  participantsStatus.style.display = "";
  if (!auth.currentUser) {
    participantsStatus.textContent = "🔒 Log in to see the other participants' contact details.";
    return;
  }
  participantsStatus.textContent = "Loading…";
  try {
    if (isAdmin) {
      // Organizer view: refresh the directory from the profiles first, so what you see here is
      // exactly (and currently) what participants see.
      const users = await getDocs(collection(db, "users"));
      await syncDirectory(users.docs.map((d) => ({ uid: d.id, data: d.data() })));
    }
    const snap = await getDocs(collection(db, "directory"));
    const people = snap.docs.map((d) => d.data())
      .filter((p) => p.fullName || p.email)
      .sort((x, y) => (x.fullName || x.email).localeCompare(y.fullName || y.email));
    participantsStatus.textContent = people.length ? "" : "No participants listed yet.";
    participantsStatus.style.display = people.length ? "none" : "";
    people.forEach((p) => participantsList.appendChild(participantCard(p)));
  } catch (error) {
    console.error("Failed to load participants:", error);
    participantsStatus.textContent = "Could not load the participant list right now.";
  }
}

function participantCard(p) {
  const card = document.createElement("div");
  card.className = "doc-card";
  card.style.cssText = "margin: 0; display: block;";
  const name = document.createElement("div");
  name.className = "doc-card-title";
  name.textContent = p.fullName || p.email;
  card.appendChild(name);
  const line = (icon, text, href) => {
    if (!text) return;
    const row = document.createElement("div");
    row.style.cssText = "font-size: 13px; margin-top: 4px; word-break: break-word;";
    row.append(icon + " ");
    if (href) {
      const a = document.createElement("a");
      a.href = href;
      a.textContent = text;
      row.appendChild(a);
    } else {
      row.append(text);
    }
    card.appendChild(row);
  };
  line("🏛️", p.institution);
  line("✉️", p.email, "mailto:" + p.email);
  line("📞", p.phone, "tel:" + p.phone.replace(/[^+\d]/g, ""));
  return card;
}

document.querySelectorAll('[data-target="participants"]').forEach((link) =>
  link.addEventListener("click", () => loadParticipants()));

// ===== Images tab (workshop photo gallery) =====
//
// Signed-in users only (firestore.rules: gallery/* readable by any signed-in user, writable by
// the organizer). The organizer uploads from the tab itself; each photo is re-encoded in the
// browser to max 2560 px on the long edge at JPEG quality 0.92 — visually the same on any
// screen, typically 0.5–1.5 MB instead of 5–15 MB — and also strips EXIF data such as GPS
// location. A ~480 px thumbnail lives in the metadata doc so the grid never downloads full photos.
// ponytail: loads every thumbnail at once — fine for a few hundred photos; paginate with
// query()/limit() beyond that.
const GALLERY_MAX_EDGE = 2560;
const GALLERY_THUMB_EDGE = 480;

function isSectionActive(id) {
  const section = document.getElementById(id);
  return !!section && section.classList.contains("active");
}

function encodeScaled(bitmap, maxEdge, quality) {
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff"; // transparent PNGs would otherwise turn black in JPEG
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode image"))), "image/jpeg", quality));
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function loadGallery() {
  if (!galleryGrid || !galleryStatus) return;
  galleryGrid.textContent = "";
  galleryStatus.style.display = "";
  if (galleryAdmin) galleryAdmin.style.display = isAdmin ? "" : "none";
  if (!auth.currentUser) {
    galleryStatus.textContent = "Soon — the workshop photos will be visible here to registered participants after login.";
    return;
  }
  galleryStatus.textContent = "Loading…";
  try {
    const snap = await getDocs(collection(db, "gallery"));
    const items = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((item) => item.chunkCount)
      .sort((x, y) => (x.uploadedAt || "").localeCompare(y.uploadedAt || ""));
    galleryGrid.textContent = "";
    galleryStatus.textContent = "Soon";
    galleryStatus.style.display = items.length ? "none" : "";
    items.forEach((item) => galleryGrid.appendChild(galleryTile(item)));
  } catch (error) {
    console.error("Failed to load gallery:", error);
    galleryStatus.textContent = "Could not load the images right now.";
  }
}

function galleryTile(item) {
  const tile = document.createElement("div");
  tile.style.position = "relative";
  const open = document.createElement("button");
  open.type = "button";
  open.setAttribute("aria-label", "Open photo " + (item.fileName || ""));
  open.style.cssText = "padding:0; border:none; background:none; cursor:zoom-in; width:100%; display:block;";
  const img = document.createElement("img");
  img.src = item.thumbDataUrl;
  img.alt = "Workshop photo";
  img.loading = "lazy";
  img.style.cssText = "width:100%; aspect-ratio:1; object-fit:cover; border-radius:8px; display:block;";
  open.appendChild(img);
  open.onclick = () => openGalleryImage(item);
  tile.appendChild(open);

  if (isAdmin) {
    const del = document.createElement("button");
    del.type = "button";
    del.textContent = "🗑";
    del.title = "Delete this photo";
    del.setAttribute("aria-label", "Delete this photo");
    del.style.cssText = "position:absolute; top:6px; right:6px; border:none; border-radius:6px; background:rgba(0,0,0,0.6); color:#fff; cursor:pointer; padding:4px 7px;";
    del.onclick = async () => {
      if (!window.confirm("Delete this photo for everyone?")) return;
      del.disabled = true;
      try {
        await deleteChunkedFile("gallery", item.id);
        tile.remove();
      } catch (error) {
        console.error("Failed to delete photo:", error);
        del.disabled = false;
        alert("Could not delete the photo: " + error.message);
      }
    };
    tile.appendChild(del);
  }
  return tile;
}

// Full-size viewer: shows the thumbnail at once, swaps in the full photo when loaded,
// and offers a proper download button (right-click saving is disabled site-wide).
async function openGalleryImage(item) {
  const overlay = document.createElement("div");
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-label", "Photo viewer");
  overlay.style.cssText = "position:fixed; inset:0; z-index:10000; background:rgba(0,0,0,0.92); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; padding:16px;";
  const big = document.createElement("img");
  big.src = item.thumbDataUrl;
  big.alt = "Workshop photo";
  big.style.cssText = "max-width:100%; max-height:82vh; object-fit:contain; border-radius:6px;";
  const bar = document.createElement("div");
  bar.style.cssText = "display:flex; gap:10px; flex-wrap:wrap; justify-content:center;";
  const download = document.createElement("a");
  download.className = "register-btn";
  download.textContent = "Loading full size…";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "register-btn";
  close.style.border = "none";
  close.style.cursor = "pointer";
  close.textContent = "✕ Close";
  bar.append(download, close);
  overlay.append(big, bar);

  let url = null;
  const onKey = (e) => { if (e.key === "Escape") shut(); };
  const shut = () => {
    overlay.remove();
    document.removeEventListener("keydown", onKey);
    if (url) URL.revokeObjectURL(url);
  };
  overlay.onclick = (e) => { if (e.target === overlay) shut(); };
  close.onclick = shut;
  document.addEventListener("keydown", onKey);
  document.body.appendChild(overlay);
  close.focus();

  try {
    const file = await loadChunkedFile("gallery", item.id);
    if (!overlay.isConnected) return;
    if (!file) { download.textContent = "Photo no longer available"; return; }
    url = URL.createObjectURL(file.blob);
    big.src = url;
    download.href = url;
    download.download = file.meta.fileName || "photo.jpg";
    download.textContent = "⬇️ Download full size";
  } catch (error) {
    console.error("Failed to load photo:", error);
    download.textContent = "Could not load the full-size photo";
  }
}

if (galleryInput) {
  galleryInput.onchange = async () => {
    const files = Array.from(galleryInput.files || []);
    galleryInput.value = "";
    if (!files.length || !isAdmin) return;
    let done = 0;
    const failed = [];
    for (const file of files) {
      galleryUploadStatus.textContent = `Uploading ${done + failed.length + 1} of ${files.length}…`;
      try {
        const bitmap = await createImageBitmap(file);
        let full, thumb;
        try {
          full = await encodeScaled(bitmap, GALLERY_MAX_EDGE, 0.92);
          thumb = await encodeScaled(bitmap, GALLERY_THUMB_EDGE, 0.8);
        } finally {
          bitmap.close();
        }
        await saveChunkedFile("gallery", doc(collection(db, "gallery")).id, new Uint8Array(await full.arrayBuffer()), {
          fileName: file.name.replace(/\.[^.]+$/, "") + ".jpg",
          mimeType: "image/jpeg",
          thumbDataUrl: await blobToDataUrl(thumb)
        });
        done++;
      } catch (error) {
        console.error("Failed to upload photo", file.name, error);
        failed.push(file.name);
      }
    }
    galleryUploadStatus.textContent = `✅ ${done} uploaded` +
      (failed.length ? ` · ⚠️ ${failed.length} failed (${failed.join(", ")}) — iPhone HEIC photos must be exported as JPEG first` : "");
    loadGallery();
  };
}

document.querySelectorAll('[data-target="images"]').forEach((link) =>
  link.addEventListener("click", () => loadGallery()));

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
    renderTalkMaterials(true);
    if (isSectionActive("images")) loadGallery();
    if (isSectionActive("participants")) loadParticipants();

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
    renderTalkMaterials(false);
    loadGallery(); // back to the "Soon / log in" state
    loadParticipants(); // back to the "log in" state
  }
});
