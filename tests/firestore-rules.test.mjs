// Security check for firestore.rules — runs against the local Firestore emulator only
// (never the live project). Run from the repo root:
//   npm i --no-save firebase-tools@13 @firebase/rules-unit-testing@3 firebase@10.9.0
//   npx firebase emulators:exec --only firestore --project demo-rules "node tests/firestore-rules.test.mjs"
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, Bytes, writeBatch } from "firebase/firestore";

const env = await initializeTestEnvironment({
  projectId: "demo-rules",
  firestore: { rules: readFileSync(new URL("../firestore.rules", import.meta.url), "utf8") },
});
await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await setDoc(doc(db, "admins/org"), {});
  await setDoc(doc(db, "speakers/spk"), { talkId: "talk-marco" });
  await setDoc(doc(db, "users/u2"), { email: "u2@x.si", invoiceVat: "SECRET" });
  await setDoc(doc(db, "directory/u2"), { fullName: "U2", email: "u2@x.si", phone: "1", institution: "UNG", updatedAt: "t" });
  await setDoc(doc(db, "settings/photos"), { driveUrl: "https://drive.google.com/x" });
});
const as = (uid, email) => (uid ? env.authenticatedContext(uid, { email }) : env.unauthenticatedContext()).firestore();
const anon = as(null), u1 = as("u1", "u1@x.si"), spk = as("spk", "spk@x.si"), org = as("org", "org@x.si");
const dir = (email) => ({ fullName: "A", email, phone: "1", institution: "UNG", updatedAt: "t" });
const jpeg = "data:image/jpeg;base64,/9j/4AAQ";
const docx = "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEsDB";
const meta = (by) => ({ fileName: "s.pdf", mimeType: "application/pdf", size: 3, chunkCount: 1, uploadedBy: by, uploadedAt: "t" });
let n = 0; const t = async (name, p) => { await p; n++; console.log("ok  " + name); };

// logged-out visitors see nothing
for (const path of ["directory/u2", "settings/photos", "presentations/talk-marco", "users/u2", "gallery/g1"])
  await t(`anon cannot read ${path}`, assertFails(getDoc(doc(anon, path))));
await t("anon cannot list directory", assertFails(getDocs(collection(anon, "directory"))));
// participants: contact list yes, private profiles no
await t("participant reads directory", assertSucceeds(getDocs(collection(u1, "directory"))));
await t("participant cannot read another profile", assertFails(getDoc(doc(u1, "users/u2"))));
await t("participant cannot list profiles", assertFails(getDocs(collection(u1, "users"))));
await t("participant cannot read another abstract", assertFails(getDoc(doc(u1, "abstracts/u2"))));
await t("participant cannot overwrite someone's directory entry", assertFails(setDoc(doc(u1, "directory/u2"), dir("u2@x.si"))));
await t("directory entry must carry own login email", assertFails(setDoc(doc(u1, "directory/u1"), dir("u2@x.si"))));
await t("directory entry rejects extra fields", assertFails(setDoc(doc(u1, "directory/u1"), { ...dir("u1@x.si"), invoiceVat: "x" })));
await t("own directory entry ok", assertSucceeds(setDoc(doc(u1, "directory/u1"), dir("u1@x.si"))));
await t("profile photo must be a JPEG data URL", assertFails(setDoc(doc(u1, "users/u1"), { photoDataUrl: "javascript:alert(1)" })));
await t("profile email must be own login email", assertFails(setDoc(doc(u1, "users/u1"), { email: "u2@x.si" })));
await t("own profile ok", assertSucceeds(setDoc(doc(u1, "users/u1"), { email: "u1@x.si", photoDataUrl: jpeg, phone: "1" })));
await t("abstract cannot be a script URL", assertFails(setDoc(doc(u1, "abstracts/u1"), { abstractDataUrl: "javascript:fetch('//evil')", fileName: "a", uploadedAt: "t" })));
await t("abstract cannot be HTML", assertFails(setDoc(doc(u1, "abstracts/u1"), { abstractDataUrl: "data:text/html;base64,PHM+", fileName: "a", uploadedAt: "t" })));
await t("own Word abstract ok", assertSucceeds(setDoc(doc(u1, "abstracts/u1"), { abstractDataUrl: docx, fileName: "a.docx", uploadedAt: "t" })));
await t("organizer reads the abstract", assertSucceeds(getDoc(doc(org, "abstracts/u1"))));
await t("participant cannot make themselves a speaker", assertFails(setDoc(doc(u1, "speakers/u1"), { talkId: "talk-marco" })));
await t("participant cannot upload slides", assertFails(setDoc(doc(u1, "presentations/talk-marco"), meta("u1"))));
await t("speaker cannot upload to another talk", assertFails(setDoc(doc(spk, "presentations/talk-klara"), meta("spk"))));
await t("speaker uploads own talk chunk", assertSucceeds(setDoc(doc(spk, "presentations/talk-marco/chunks/0"), { data: Bytes.fromUint8Array(new Uint8Array([1, 2, 3])) })));
await t("chunk must be bytes", assertFails(setDoc(doc(spk, "presentations/talk-marco/chunks/1"), { data: "<script>" })));
await t("chunk id must be numeric", assertFails(setDoc(doc(spk, "presentations/talk-marco/chunks/x"), { data: Bytes.fromUint8Array(new Uint8Array([1])) })));
await t("speaker writes own talk metadata", assertSucceeds(setDoc(doc(spk, "presentations/talk-marco"), meta("spk"))));
await t("participant downloads slides", assertSucceeds(getDoc(doc(u1, "presentations/talk-marco"))));
await t("participant reads photo-folder link", assertSucceeds(getDoc(doc(u1, "settings/photos"))));
await t("participant cannot change photo-folder link", assertFails(setDoc(doc(u1, "settings/photos"), { driveUrl: "https://evil" })));
await t("participant cannot add gallery photos", assertFails(setDoc(doc(u1, "gallery/g1"), { a: 1 })));
await t("participant cannot write letters", assertFails(setDoc(doc(u1, "letters/u1"), { pdfDataUrl: "x" })));
await t("nobody can make themselves admin", assertFails(setDoc(doc(u1, "admins/u1"), {})));
const fb = { v: 1, role: "Participant", overall: 5, sessions: ["lab", "denovo"], liked: "the lab", accommodation: 0 };
const send = (db, uid, id, data) => { const b = writeBatch(db); b.set(doc(db, "feedbackSent", uid), {}); b.set(doc(db, "feedback", id), data); return b.commit(); };
await t("anon cannot send feedback", assertFails(setDoc(doc(anon, "feedback/a1"), fb)));
await t("answer without its marker is refused", assertFails(setDoc(doc(u1, "feedback/f0"), fb)));
await t("feedback cannot carry identity fields", assertFails(send(u1, "u1", "f2", { ...fb, uid: "u1" })));
await t("feedback scales are 1..5", assertFails(send(u1, "u1", "f3", { ...fb, overall: 9 })));
await t("feedback sessions max 3 known ids", assertFails(send(u1, "u1", "f4", { ...fb, sessions: ["lab", "x"] })));
await t("participant sends feedback once", assertSucceeds(send(u1, "u1", "f1", fb)));
await t("second answer from the same account is refused", assertFails(send(u1, "u1", "f5", fb)));
await t("second answer without marker is refused", assertFails(setDoc(doc(u1, "feedback/f6"), fb)));
await t("participant cannot delete own marker", assertFails(deleteDoc(doc(u1, "feedbackSent/u1"))));
await t("participant cannot create someone else's marker", assertFails(setDoc(doc(u1, "feedbackSent/u2"), {})));
await t("participant cannot read feedback", assertFails(getDoc(doc(u1, "feedback/f1"))));
await t("participant cannot list feedback", assertFails(getDocs(collection(u1, "feedback"))));
await t("participant cannot edit feedback", assertFails(setDoc(doc(u1, "feedback/f1"), { ...fb, overall: 1 })));
await t("organizer reads feedback", assertSucceeds(getDocs(collection(org, "feedback"))));
await t("settings limited to the photo link", assertFails(setDoc(doc(org, "settings/other"), { driveUrl: "https://drive.google.com/z", updatedAt: "t" })));
await t("organizer lists profiles", assertSucceeds(getDocs(collection(org, "users"))));
await t("organizer sets photo-folder link", assertSucceeds(setDoc(doc(org, "settings/photos"), { driveUrl: "https://drive.google.com/y", updatedAt: "t" })));
await t("participant can delete own account data", assertSucceeds(Promise.all([deleteDoc(doc(u1, "users/u1")), deleteDoc(doc(u1, "abstracts/u1")), deleteDoc(doc(u1, "directory/u1"))])));
await env.cleanup();
console.log(`\nall ${n} checks passed`);
