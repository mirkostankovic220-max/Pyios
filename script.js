let pyodide = null;
let ready = false;

let inputResolve = null;


// Load Python
async function startPython(){

    document.getElementById("output").innerHTML =
    "Loading Python...\n";

    pyodide = await loadPyodide();


    // Create working input() replacement
    await pyodide.runPythonAsync(`
import builtins

async def browser_input(prompt=""):

    from js import get_input

    value = await get_input(prompt)

    return value


builtins.input = browser_input
`);


    ready = true;


    document.getElementById("output").innerHTML =
    "Python Ready!\n\n";

}


startPython();





// Run Python
async function runCode(){


    if(!ready){

        alert("Python is loading...");

        return;

    }


    document.getElementById("editorPage").style.display="none";

    document.getElementById("terminal").style.display="flex";


    let output =
    document.getElementById("output");


    output.textContent="";


    let code =
    document.getElementById("code").value;



    pyodide.setStdout({

        batched(text){

            output.textContent += text;

            output.scrollTop =
            output.scrollHeight;

        }

    });



    pyodide.setStderr({

        batched(text){

            output.textContent +=
            "\nERROR: "+text;

        }

    });



    try{


        await pyodide.runPythonAsync(code);


        output.textContent +=
        "\n\n[Program finished]";


    }


    catch(e){

        output.textContent +=
        "\n\n"+e;

    }


}





// Browser input system
window.get_input = function(prompt){


    return new Promise(resolve=>{


        let output =
        document.getElementById("output");


        output.textContent +=
        prompt;


        inputResolve = resolve;


        document
        .getElementById("terminalInput")
        .focus();


    });


}





function sendInput(event){


    if(event.key === "Enter"){


        let box =
        document.getElementById("terminalInput");


        let value =
        box.value;


        document.getElementById("output")
        .textContent +=
        value+"\n";


        box.value="";


        if(inputResolve){

            inputResolve(value);

            inputResolve=null;

        }


    }


}





function closeTerminal(){


    document.getElementById("terminal")
    .style.display="none";


    document.getElementById("editorPage")
    .style.display="block";


}





function saveCode(){


    localStorage.setItem(

        "pyios_code",

        document.getElementById("code").value

    );


}





window.onload=function(){


let saved =
localStorage.getItem("pyios_code");


if(saved){

document.getElementById("code").value=saved;

}


}





function downloadCode(){


let blob =
new Blob(

[
document.getElementById("code").value
],

{
type:"text/python"
}

);


let a =
document.createElement("a");


a.href =
URL.createObjectURL(blob);


a.download="main.py";


a.click();


}
