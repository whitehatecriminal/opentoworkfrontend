import { auth } from "./firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut
} from "firebase/auth";

export const signinWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const loginWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  
  // If user's email is not yet verified, send or resend verification email
  const sendmail = await sendEmailVerification(result.user);
  console.log("Mail sent", sendmail)
  

  return result.user;
};

export const signupWithEmail = async (name, email, password) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  if (name && result.user) {
    try {
      await updateProfile(result.user, { displayName: name });
    } catch (profileErr) {
      console.warn("Could not update displayName:", profileErr);
    }
  }

  // Send verification email to the user
  if (result.user) {
    try {
      await sendEmailVerification(result.user);
      console.log("Verification email successfully sent to:", result.user.email);
    } catch (emailErr) {
      console.error("Firebase sendEmailVerification error:", emailErr);
      throw emailErr;
    }
  }

  return result.user;
};

export const sendVerificationEmail = async (user) => {
  const targetUser = user || auth.currentUser;
  if (targetUser) {
    await sendEmailVerification(targetUser);
    console.log("Manual verification email sent to:", targetUser.email);
  }
};

export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const getAuthErrorMessage = (error) => {
  const code = error?.code || "";
  switch (code) {
    case "auth/invalid-email":
      return "Invalid email address format.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password. Please try again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please log in.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed before completing.";
    case "auth/cancelled-popup-request":
      return "Multiple popups opened. Please try again.";
    case "auth/network-request-failed":
      return "Network connection error. Check your internet connection.";
    default:
      return error?.message || "An unexpected error occurred. Please try again.";
  }
};
