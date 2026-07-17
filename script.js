let pyodide = null;
let isReady = false;
let currentInputResolve = null;

async function initPyodide() {
    const outputEl = document.getElementById("output");
    outputEl.textContent = "Loading Pyodide (Python in browser)...\nThis may take 10-20 seconds on first load.\n\n";

    try {
        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/",
            stdout: (text) => {
                outputEl.textContent += text + "\n";
                outputEl.scrollTop = outputEl.scrollHeight;
            },
            stderr: (text) => {
                outputEl.textContent += "ERROR: " + text + "\n";
                outputEl.scrollTop = outputEl.scrollHeight;
            }
        });

        // Enable better input support
        await pyodide.runPythonAsync(`
            import sys
            from pyodide.ffi import to_js
            print("Pyodide initialized successfully! ✅")
        `);

        isReady = true;
        outputEl.textContent += "✅ Python is ready! You can run code now.\n\n";
    } catch (err) {
        outputEl.textContent += "Failed to load Pyodide: " + err.message;
        console.error(err);
    }
}

initPyodide();

async function runCode() {
    if (!isReady) {
        alert("Python is still loading. Please wait a moment.");
        return;
    }

    const editorPage = document.getElementById("editorPage");
    const terminal = document.getElementById("terminal");
    const outputEl = document.getElementById("output");

    editorPage.style.display = "none";
    terminal.style.display = "flex";
    outputEl.textContent = "";

    const code = document.getElementById("code").value.trim();

    try {
        // Simple stdin handler using the terminal input
        const stdinHandler = () => {
            return new Promise((resolve) => {
                currentInputResolve = resolve;
                const promptEl = document.getElementById("prompt");
                promptEl.textContent = ">>> ";
                document.getElementById("terminalInput").focus();
            });
        };

        // Override input for this execution
        pyodide.setStdin(stdinHandler);

        await pyodide.runPythonAsync(code);

        outputEl.textContent += "\n[Program finished successfully ✓]";
    } catch (err) {
        outputEl.textContent += `\n[ERROR]\n${err.message}`;
        console.error(err);
    } finally {
        // Reset stdin
        pyodide.setStdin(() => prompt("Input:") || "");
    }
}

function handleInput(event) {
    if (event.key === "Enter") {
        const inputEl = document.getElementById("terminalInput");
        const value = inputEl.value.trim();
        const outputEl = document.getElementById("output");

        if (value) {
            outputEl.textContent += value + "\n";
            outputEl.scrollTop = outputEl.scrollHeight;
        }

        inputEl.value = "";

        if (currentInputResolve) {
            currentInputResolve(value);
            currentInputResolve = null;
        }
    }
}

function closeTerminal() {
    document.getElementById("terminal").style.display = "none";
    document.getElementById("editorPage").style.display = "block";
}

function saveCode() {
    localStorage.setItem("pyios_code", document.getElementById("code").value);
    alert("Code saved to browser storage!");
}

function downloadCode() {
    const code = document.getElementById("code").value;
    const blob = new Blob([code], { type: "text/python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "main.py";
    a.click();
    URL.revokeObjectURL(url);
}

function clearEditor() {
    if (confirm("Clear the editor?")) {
        document.getElementById("code").value = "";
    }
}

// Load saved code
window.onload = () => {
    const saved = localStorage.getItem("pyios_code");
    if (saved) {
        document.getElementById("code").value = saved;
    }
};
