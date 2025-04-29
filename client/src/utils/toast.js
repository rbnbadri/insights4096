export const triggerGreenToast = (message) => {
  console.log("Triggering green toast message from toast.js:", message);
  window.dispatchEvent(new CustomEvent("trigger-green-toast", { detail: message }));
};

export const triggerRedToast = (message) => {
  console.log("Triggering red toast message from toast.js:", message);
  window.dispatchEvent(new CustomEvent("trigger-red-toast", { detail: message }));
};
