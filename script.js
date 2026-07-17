let pyodide = null;
let ready = false;
let inputResolve = null;
let outputBuffer = "";

async function startPython() {
  document.getElementById("output").textContent = "Loading Python...\n";
  
  pyodide = await loadPyodide();
  
  pyodide.setStdout({
    batched(text) {
      outputBuffer += text;
      document.getElementById("output").textContent += text;
    }
  });
  
  pyodide.setStderr({
    batched(text) {
      outputBuffer += text;
      document.getElementById("output").textContent += text;
    }
  });
  
  // ISPRAVKA: setStdin prima funkciju, ne objekat
  pyodide.setStdin(() => {
    console.log("stdin called - waiting for input...");
    return new Promise((resolve) => {
      inputResolve = resolve;
    });
  });
  
  ready = true;
  document.getElementById("output").textContent = "Python Ready!\n\n";
}

startPython();

async function runCode() {
  if (!ready) {
    alert("Python is loading...");
    return;
  }
  
  document.getElementById("editorPage").style.display = "none";
  document.getElementById("terminal").style.display = "flex";
  document.getElementById("output").textContent = "";
  outputBuffer = "";
  
  let code = document.getElementById("code").value;
  
  try {
    await pyodide.runPythonAsync(code);
    document.getElementById("output").textContent += "\n\n[Finished]";
  } catch(e) {
    document.getElementById("output").textContent += "\n\nERROR:\n" + e;
  }
}

function sendInput(event) {
  if (event.key === "Enter") {
    let box = document.getElementById("terminalInput");
    let value = box.value;
    
    // Dodaj unos u output
    document.getElementById("output").textContent += value + "\n";
    box.value = "";
    
    // Pošalji input Python kodu
    if (inputResolve) {
      console.log("Sending input:", value);
      inputResolve(value + "\n");
      inputResolve = null;
    }
  }
}

function closeTerminal() {
  document.getElementById("terminal").style.display = "none";
  document.getElementById("editorPage").style.display = "block";
}

function saveCode() {
  localStorage.setItem("pyios_code", document.getElementById("code").value);
}

window.onload = () => {
  let saved = localStorage.getItem("pyios_code");
  if (saved) {
    document.getElementById("code").value = saved;
  }
}

function downloadCode() {
  let blob = new Blob(
    [document.getElementById("code").value],
    { type: "text/python" }
  );
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "main.py";
  a.click();
}

// Dodatno: fokusiraj input polje kad se terminal otvori
// Ovo će pratiti promjene u DOM-u i fokusirati input
const observer = new MutationObserver(() => {
  const terminal = document.getElementById("terminal");
  if (terminal.style.display === "flex") {
    setTimeout(() => {
      document.getElementById("terminalInput").focus();
    }, 100);
  }
});

observer.observe(document.getElementById("terminal"), {
  attributes: true,
  attributeFilter: ["style"]
});
