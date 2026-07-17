let pyodide = null;
let isReady = false;
let inputQueue = [];
let currentResolve = null;

async function initPyodide() {
    const output = document.getElementById("output");
    output.textContent = "Loading Python (Pyodide)...\n\n";

    pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/",
        stdout: (msg) => appendOutput(msg),
        stderr: (msg) => appendOutput("ERROR: " + msg, true)
    });

    // Setup stdin handler
    pyodide.setStdin(() => {
        if (inputQueue.length > 0) {
            return inputQueue.shift();
        }
        // If no input ready, we'll handle it via promise
        return new Promise((resolve) => {
            currentResolve = resolve;
        });
    });

    isReady = true;
    appendOutput("✅ Python ready! Try running code with input().\n");
}

function appendOutput(text, isError = false) {
    const output = document.getElementById("output");
    const prefix = isError ? "❌ " : "";
    output.textContent += prefix + text + "\n";
    output.scrollTop = output.scrollHeight;
}

async function runCode() {
    if (!isReady) {
        alert("Python is still loading...");
        return;
    }

    document.getElementById("editorPage").style.display = "none";
    const terminal = document.getElementById("terminal");
    const output = document.getElementById("output");

    terminal.style.display = "flex";
    output.textContent = "";

    const code = document.getElementById("code").value.trim();

    try {
        await pyodide.runPythonAsync(code);
        appendOutput("\n[Program finished successfully ✓]");
    } catch (err) {
        appendOutput(err.message, true);
    }
}

function handleInput(e) {
    if (e.key === "Enter") {
        const inputEl = document.getElementById("terminalInput");
        const value = inputEl.value;
        
        // Echo input
        appendOutput(value);
        
        if (currentResolve) {
            currentResolve(value);
            currentResolve = null;
        } else {
            inputQueue.push(value);
        }
        
        inputEl.value = "";
    }
}

function closeTerminal() {
    document.getElementById("terminal").style.display = "none";
    document.getElementById("editorPage").style.display = "block";
    inputQueue = [];
    currentResolve = null;
}

// Other functions (save, download, clear) remain the same
function saveCode() {
    localStorage.setItem("pyios_code", document.getElementById("code").value);
    alert("Code saved!");
}

function downloadCode() {
    const code = document.getElementById("code").value;
    const blob = new Blob([code], { type: "text/python" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "main.py";
    a.click();
}

function clearEditor() {
    if (confirm("Clear editor?")) document.getElementById("code").value = "";
}

window.onload = () => {
    const saved = localStorage.getItem("pyios_code");
    if (saved) document.getElementById("code").value = saved;
    
    initPyodide().catch(console.error);
};
