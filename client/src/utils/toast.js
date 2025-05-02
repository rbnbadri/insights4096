export const triggerGreenToast = (message) => {
  window.dispatchEvent(
    new CustomEvent("trigger-green-toast", { detail: message }),
  );
};

export const triggerRedToast = (message) => {
  window.dispatchEvent(
    new CustomEvent("trigger-red-toast", { detail: message }),
  );
};

export const triggerGreyToastStart = () => {
  window.dispatchEvent(new CustomEvent("trigger-grey-toast-start"));
};

export const triggerGreyToastStop = () => {
  window.dispatchEvent(new CustomEvent("trigger-grey-toast-stop"));
};
