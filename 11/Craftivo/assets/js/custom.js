document.addEventListener("DOMContentLoaded", () => {

  const form = document.querySelector("#custom-contact-form");
  const submitBtn = document.querySelector("#custom-submit");

  // Visi formos laukai
  const fields = {
    vardas: document.querySelector("#vardas"),
    pavarde: document.querySelector("#pavarde"),
    email: document.querySelector("#email"),
    tel: document.querySelector("#tel"),
    adresas: document.querySelector("#adresas"),
    q1: document.querySelector("#q1"),
    q2: document.querySelector("#q2"),
    q3: document.querySelector("#q3"),
  };

  // -------- REAL-TIME VALIDACIJA -------------
  const validators = {
    vardas: value => /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]+$/.test(value),
    pavarde: value => /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]+$/.test(value),
    email: value => /^\S+@\S+\.\S+$/.test(value),
    adresas: value => value.trim().length > 3,
    q1: value => value >= 1 && value <= 10,
    q2: value => value >= 1 && value <= 10,
    q3: value => value >= 1 && value <= 10,
  };

  const errors = {};

  function showError(field, message) {
    errors[field] = true;
    const input = fields[field];
    input.classList.add("error");

    let msg = input.nextElementSibling;
    if (!msg || !msg.classList.contains("error-msg")) {
      msg = document.createElement("small");
      msg.classList.add("error-msg");
      input.insertAdjacentElement("afterend", msg);
    }
    msg.textContent = message;

    updateSubmitButton();
  }

  function clearError(field) {
    errors[field] = false;
    const input = fields[field];
    input.classList.remove("error");

    let msg = input.nextElementSibling;
    if (msg && msg.classList.contains("error-msg")) msg.remove();

    updateSubmitButton();
  }

  // -------- TELEFONO FORMATAVIMAS ------------
  fields.tel.addEventListener("input", () => {
    let raw = fields.tel.value.replace(/\D/g, "");
    if (!raw.startsWith("3706")) raw = "3706" + raw.slice(4);

    if (raw.length > 11) raw = raw.slice(0, 11);

    const formatted = `+${raw.slice(0, 3)} ${raw.slice(3, 4)}${raw.slice(4, 6)} ${raw.slice(6)}`;
    fields.tel.value = formatted;
  });

  // -------- REAL-TIME VALIDACIJOS PRIJUNGIMAS -----------
  Object.keys(fields).forEach(field => {
    if (field === "tel") return;

    fields[field].addEventListener("input", () => {
      const value = fields[field].value.trim();

      if (!value) {
        showError(field, "Laukas negali būti tuščias.");
      } else if (validators[field] && !validators[field](value)) {
        showError(field, "Neteisingas formato įvedimas.");
      } else {
        clearError(field);
      }
    });
  });

  // ---- SUBMIT mygtuko valdymas -----
  function updateSubmitButton() {
    const hasErrors = Object.values(errors).some(e => e === true);
    submitBtn.disabled = hasErrors;
  }

  // -------- FORMOS PATEIKIMAS -------------
  form.addEventListener("submit", e => {
    e.preventDefault();

    const data = {
      vardas: fields.vardas.value,
      pavarde: fields.pavarde.value,
      email: fields.email.value,
      telefonas: fields.tel.value,
      adresas: fields.adresas.value,
      q1: Number(fields.q1.value),
      q2: Number(fields.q2.value),
      q3: Number(fields.q3.value),
    };

    console.log("Formos duomenys:", data);

    const avg = ((data.q1 + data.q2 + data.q3) / 3).toFixed(1);

    // Atvaizdavimas svetainėje
    const output = document.querySelector("#form-output");
    output.innerHTML = `
      <p><strong>Vardas:</strong> ${data.vardas}</p>
      <p><strong>Pavardė:</strong> ${data.pavarde}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Telefonas:</strong> ${data.telefonas}</p>
      <p><strong>Adresas:</strong> ${data.adresas}</p>
      <p><strong>Klausimas 1:</strong> ${data.q1}</p>
      <p><strong>Klausimas 2:</strong> ${data.q2}</p>
      <p><strong>Klausimas 3:</strong> ${data.q3}</p>
      <hr>
      <p><strong>${data.vardas} ${data.pavarde}: ${avg}</strong></p>
    `;

    // ---- POPUP ----
    const popup = document.querySelector("#popup-success");
    popup.classList.add("show");
    setTimeout(() => popup.classList.remove("show"), 3000);
  });

});