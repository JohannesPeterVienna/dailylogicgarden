(() => {
  const controls = document.querySelector("#row-lab-controls");
  const slots = Array.from(controls.querySelectorAll("select"));
  const verdict = document.querySelector("#row-verdict");
  const patterns = [];
  for (let n = 0; n < 64; n++) {
    const row = n.toString(2).padStart(6, "0").replaceAll("0", "D").replaceAll("1", "S");
    if (row.split("S").length === 4 && !/(SSS|DDD)/.test(row)) patterns.push(row);
  }
  function update() {
    const matches = patterns.filter(row => slots.every((slot, i) => slot.value === "?" || slot.value === row[i]));
    if (!matches.length) {
      verdict.textContent = "No completion fits. Clear a clue and check the count and adjacent triples.";
      return;
    }
    const forced = [];
    slots.forEach((slot, i) => {
      if (slot.value === "?" && matches.every(row => row[i] === matches[0][i]))
        forced.push("square " + (i + 1) + " is " + (matches[0][i] === "S" ? "sun" : "shade"));
    });
    const conclusion = forced.length ? forced.join(", ") : slots.some(s => s.value === "?") ? "no blank is forced by this row alone" : "valid completed row";
    verdict.textContent = matches.length + (matches.length === 1 ? " completion. " : " completions. ") + conclusion + ". Patterns (S = sun, D = shade): " + matches.join(", ") + ".";
  }
  controls.addEventListener("change", update);
  update();
})();
