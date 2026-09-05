const onboardingForm = document.querySelector('#onboarding-form');
const onboardingSteps = [...document.querySelectorAll('.onboarding-step')];
const stepIndicators = [...document.querySelectorAll('[data-step-indicator]')];
const nextStepButton = document.querySelector('#next-step');
const previousStepButton = document.querySelector('#previous-step');
const submitOnboardingButton = document.querySelector('#submit-onboarding');
const onboardingSuccess = document.querySelector('#onboarding-success');
const clearDraftButton = document.querySelector('#clear-draft');
const editBriefButton = document.querySelector('#edit-brief');
const copySummaryButton = document.querySelector('#copy-summary');
const openEmailButton = document.querySelector('#open-email');
const summaryOutput = document.querySelector('#summary-output');
const autosaveNote = document.querySelector('#autosave-note');
const copyStatus = document.querySelector('#copy-status');
const storageKey = 'ajnl-onboarding-draft-v1';
const contactEmail = 'alexisjnegron@gmail.com';
const onboardingReduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

let currentStep = 0;

const getField = (name) => onboardingForm?.elements.namedItem(name);

const getFormData = () => {
  const scope = [...onboardingForm.querySelectorAll('input[name="scope"]:checked')].map((input) => input.value);
  const followUp = getField('followUp');

  return {
    clientName: getField('clientName')?.value.trim() || '',
    clientEmail: getField('clientEmail')?.value.trim() || '',
    projectType: getField('projectType')?.value || '',
    projectGoal: getField('projectGoal')?.value.trim() || '',
    scope,
    currentSite: getField('currentSite')?.value.trim() || '',
    features: getField('features')?.value.trim() || '',
    budget: getField('budget')?.value || '',
    timeline: getField('timeline')?.value || '',
    extraNotes: getField('extraNotes')?.value.trim() || '',
    followUp: followUp?.checked ? 'Yes' : 'No',
  };
};

const resetCopyStatus = () => {
  if (copyStatus) copyStatus.textContent = '';
};

const saveDraft = () => {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(getFormData()));
    if (autosaveNote) autosaveNote.textContent = 'Draft saved in this browser.';
  } catch {
    if (autosaveNote) autosaveNote.textContent = 'Draft saving is unavailable in this browser.';
  }
};

const restoreDraft = () => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) || 'null');
    if (!saved) return;

    Object.entries(saved).forEach(([name, value]) => {
      if (name === 'scope') {
        value.forEach((scopeValue) => {
          const checkbox = onboardingForm.querySelector(`input[name="scope"][value="${scopeValue}"]`);
          if (checkbox) checkbox.checked = true;
        });
        return;
      }
      if (name === 'followUp') {
        const followUp = getField('followUp');
        if (followUp) followUp.checked = value === 'Yes';
        return;
      }
      const field = getField(name);
      if (field) field.value = value;
    });
  } catch {
    if (autosaveNote) autosaveNote.textContent = 'Saved draft could not be restored.';
  }
};

const clearErrors = (step) => {
  step.querySelectorAll('.has-error').forEach((field) => field.classList.remove('has-error'));
  step.querySelectorAll('.field-error').forEach((error) => {
    error.textContent = '';
  });
};

const showError = (fieldName, message) => {
  const field = getField(fieldName);
  const group = field?.closest?.('.field-group');
  const error = document.querySelector(`[data-error-for="${fieldName}"]`);
  group?.classList.add('has-error');
  if (error) error.textContent = message;
};

const validateStep = (stepIndex) => {
  const step = onboardingSteps[stepIndex];
  if (!step) return true;
  clearErrors(step);
  let isValid = true;

  step.querySelectorAll('[required]').forEach((field) => {
    if (!field.checkValidity()) {
      isValid = false;
      showError(field.name, field.type === 'email' ? 'Enter a valid email address.' : 'This field is required.');
    }
  });

  if (stepIndex === 1 && !onboardingForm.querySelector('input[name="scope"]:checked')) {
    isValid = false;
    showError('scope', 'Choose at least one area of help.');
  }

  return isValid;
};

const updateStep = (nextIndex) => {
  currentStep = Math.max(0, Math.min(nextIndex, onboardingSteps.length - 1));

  onboardingSteps.forEach((step, index) => {
    const isActive = index === currentStep;
    step.classList.toggle('is-active', isActive);
    step.hidden = !isActive;
  });

  stepIndicators.forEach((indicator, index) => {
    const isActive = index === currentStep;
    indicator.classList.toggle('is-active', isActive);
    if (isActive) indicator.setAttribute('aria-current', 'step');
    else indicator.removeAttribute('aria-current');
  });

  syncStepControls();
  window.scrollTo({
    top: document.querySelector('.onboarding-card')?.offsetTop - 30,
    behavior: onboardingReduceMotion ? 'auto' : 'smooth',
  });
};

const syncStepControls = () => {
  const isFinalStep = currentStep === onboardingSteps.length - 1;
  const showBack = currentStep > 0;

  previousStepButton.hidden = !showBack;
  nextStepButton.hidden = isFinalStep;
  submitOnboardingButton.hidden = !isFinalStep;

  previousStepButton.setAttribute('aria-hidden', String(previousStepButton.hidden));
  nextStepButton.setAttribute('aria-hidden', String(nextStepButton.hidden));
  submitOnboardingButton.setAttribute('aria-hidden', String(submitOnboardingButton.hidden));

  if (!nextStepButton.hidden && !submitOnboardingButton.hidden) {
    submitOnboardingButton.hidden = true;
    submitOnboardingButton.setAttribute('aria-hidden', 'true');
  }
};

const formatSummary = (data) => {
  const lines = [
    'AJNL DEVELOPMENT — PROJECT BRIEF',
    '=================================',
    `Name: ${data.clientName}`,
    `Email: ${data.clientEmail}`,
    `Project type: ${data.projectType}`,
    '',
    'GOAL',
    data.projectGoal || 'Not provided',
    '',
    'SCOPE',
    data.scope.length ? data.scope.map((item) => `- ${item}`).join('\n') : 'Not provided',
    '',
    `Current site: ${data.currentSite || 'None provided'}`,
    `Budget: ${data.budget || 'Not provided'}`,
    `Timeline: ${data.timeline || 'Not provided'}`,
    '',
    'FEATURES / REFERENCES',
    data.features || 'Not provided',
    '',
    'ADDITIONAL NOTES',
    data.extraNotes || 'Not provided',
    '',
    `Okay to follow up: ${data.followUp}`,
  ];

  return lines.join('\n');
};

const openEmailDraft = () => {
  if (copyStatus) copyStatus.textContent = 'Opening your default email provider…';
  const subject = encodeURIComponent('AJNL Development project brief');
  const body = encodeURIComponent(summaryOutput.value);
  window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
};

const copyWithFallback = () => {
  const fallbackField = document.createElement('textarea');
  fallbackField.value = summaryOutput.value;
  fallbackField.setAttribute('readonly', '');
  fallbackField.style.position = 'fixed';
  fallbackField.style.opacity = '0';
  document.body.append(fallbackField);
  fallbackField.select();

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
  }

  fallbackField.remove();
  return copied;
};

restoreDraft();
syncStepControls();

onboardingForm?.addEventListener('input', saveDraft);
onboardingForm?.addEventListener('change', saveDraft);

previousStepButton?.addEventListener('click', () => updateStep(currentStep - 1));

onboardingForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (currentStep < onboardingSteps.length - 1) {
    if (!validateStep(currentStep)) return;
    saveDraft();
    updateStep(currentStep + 1);
    return;
  }

  if (!validateStep(currentStep)) return;

  resetCopyStatus();
  const summary = formatSummary(getFormData());
  summaryOutput.value = summary;
  onboardingForm.hidden = true;
  onboardingSuccess.hidden = false;
  onboardingSuccess.scrollIntoView({ behavior: onboardingReduceMotion ? 'auto' : 'smooth', block: 'start' });
});

clearDraftButton?.addEventListener('click', () => {
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
  }
  onboardingForm.reset();
  onboardingForm.hidden = false;
  onboardingSuccess.hidden = true;
  resetCopyStatus();
  clearErrors(onboardingSteps[currentStep]);
  updateStep(0);
  if (autosaveNote) autosaveNote.textContent = 'Draft cleared.';
});

editBriefButton?.addEventListener('click', () => {
  onboardingSuccess.hidden = true;
  onboardingForm.hidden = false;
  resetCopyStatus();
  updateStep(0);
});

copySummaryButton?.addEventListener('click', async () => {
  if (copyStatus) copyStatus.textContent = 'Copying summary…';

  let copied = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(summaryOutput.value);
      copied = true;
    }
  } catch {
  }

  if (!copied) {
    try {
      copied = copyWithFallback();
    } catch {
    }
  }

  if (copied) {
    if (copyStatus) copyStatus.textContent = 'Summary copied to your clipboard.';
    return;
  }

  if (summaryOutput) {
    summaryOutput.focus();
    summaryOutput.select();
  }
  if (copyStatus) copyStatus.textContent = 'The summary is selected. Press Command+C or Control+C to copy it.';
});

openEmailButton?.addEventListener('click', openEmailDraft);
