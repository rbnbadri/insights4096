export const triggerToast = (message) => {
  console.log("Triggering toast message from toast.js:", message);
  window.dispatchEvent(new CustomEvent("trigger-toast", { detail: message }));
};
