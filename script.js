const form = document.querySelector('form');
const toast = document.querySelector('.success-toast');

function getErrorMessage(input) {
  const rawLabel = document.querySelector(`label[for="${input.id}"]`)?.textContent.trim()
    || input.name
    || "This field";

  const cleanLabel = rawLabel.replace("*", "").trim();

  // ── Normale Felder ───────────────────────────────────────────
  if (input.validity.valueMissing) {
    if (input.name != "agb") {
      return `${cleanLabel} is required.`;
    }
    return "To submit this form, please consent to being contacted";
  }

  if (input.validity.patternMismatch && input.type != "email") {
    return "Please enter a valid name using letters, spaces, hyphens (-), or apostrophes (').";
  }

  if (input.validity.typeMismatch && input.type === "email") {
    return "Please enter a valid email address.";
  }

  if (input.validity.tooShort) {
    return `Please enter at least ${input.minLength} characters.`;
  }

  return "Please correct this value.";
}

function validateField(field) {
  // Radio-Gruppe → wir behandeln die ganze Gruppe
  if (field.type === "radio") {
    const errorEl = document.getElementById("queryType-error");
    const groupName = field.name;
    const isValid = Boolean(document.querySelector(`input[name="${groupName}"]:checked`));


    if (isValid) {
      errorEl.hidden = true;
      errorEl.textContent = "";
      // aria-invalid entfernen von allen Radios der Gruppe
      document.querySelectorAll(`input[name="${groupName}"]`).forEach(r => {
        r.removeAttribute("aria-invalid");
      });
    } else {
      errorEl.hidden = false;
      errorEl.textContent = "Please select a query type.";
      // aria-invalid auf allen setzen
      document.querySelectorAll(`input[name="${groupName}"]`).forEach(r => {
        r.setAttribute("aria-invalid", "true");
      });
    }
    return !isValid; // true = Fehler vorhanden
  }

  // Alle anderen Felder (text, email, textarea, checkbox)
  const errorEl = document.getElementById(`${field.id}-error`);
  if (!errorEl) return false;

  if (field.validity.valid) {
    field.removeAttribute("aria-invalid");
    errorEl.hidden = true;
    errorEl.textContent = "";
    return false;
  } else {
    field.setAttribute("aria-invalid", "true");
    errorEl.hidden = false;
    errorEl.textContent = getErrorMessage(field);
    return true;
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  let hasError = false;
  let firstErrorField = null;

  const fields = form.querySelectorAll("input, textarea");
  const validatedRadioNames = new Set();

  fields.forEach((field) => {
    
    if (field.type === "radio") {
      if (validatedRadioNames.has(field.name)) return;
      validatedRadioNames.add(field.name);

      const group = form.querySelectorAll(`input[type="radio"][name="${CSS.escape(field.name)}"]`);

      const groupHasError = validateField(group[0]);

      if (groupHasError) {
        hasError = true;
        if (!firstErrorField) firstErrorField = group[0];
      }
      return;
    }

    // Normale Felder
    const fieldHasError = validateField(field);
    if (fieldHasError) {
      hasError = true;
      if (!firstErrorField) firstErrorField = field;
    }
  });

  if (hasError) {
    firstErrorField?.focus();
    return;
  }

  // Erfolg
  showToast();
  setTimeout(hideToast, 4000);

  // form.submit();
});


// Live-Validierung (blur/change)
form.addEventListener("change", e => {
  if (e.target.type === "radio" || e.target.type === "checkbox") {
    validateField(e.target);
  }
});

form.addEventListener("blur", e => {
  const field = e.target;
  if (field.matches("input:not([type=radio]):not([type=checkbox]), textarea")) {
    validateField(field);
  }
}, true);


function showToast() {
  toast.hidden = false;

  requestAnimationFrame(() => {
    toast.classList.add('is-visible');
  });
}

function hideToast() {
  toast.classList.remove('is-visible');

  toast.addEventListener(
    'transitionend',
    () => {
      toast.hidden = true;
    },
    { once: true }
  );
}