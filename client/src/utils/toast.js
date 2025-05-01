export const triggerGreenToast = (message) => {
  window.dispatchEvent(new CustomEvent("trigger-green-toast", { detail: message }));
};

export const triggerRedToast = (message) => {
  window.dispatchEvent(new CustomEvent("trigger-red-toast", { detail: message }));
};
