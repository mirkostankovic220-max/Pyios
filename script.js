let pyodide = null;
let pythonReady = false;

let inputCallback = null;


// Load Python
async function startPython(){

    document.getElementById("output").textContent =
    "Loading Python...\n";

    try{

        pyodide = await loadPyodide();

        pythonReady = true;

        document.getElementById("output").textContent =
        "Python Ready!\n\n";

    }

    catch(e){

        document.getElementById("output").textContent =
        "Python loading error:\n"+e;

    }

}


startPython();



async function runCode(){

    if(!pythonReady){

        alert("Python is still loading. Wait a few seconds.");

        return;

    }


    document.getElementById("editorPage").style.display="none";

    document.getElementById("terminal").style.display="flex";


    let output=document.getElementById("output");

    output.textContent="";


    let code=document.getElementById("code").value;



    // Output redirect
    pyodide.setStdout({

        batched(text){

            output.textContent += text;

            output.scrollTop =
            output.scrollHeight;

        }

    });



    // Input support
    pyodide.setStdin({

        stdin(){

            return new Promise(resolve=>{

                inputCallback=resolve;

            });

        }

    });



    try{


        await pyodide.runPythonAsync(code);


        output.textContent +=
        "\n\nProgram finished.";


    }


    catch(error){

        output.textContent +=
        "\n\nERROR:\n"+error;

    }


}



function sendInput(event){

    if(event.key==="Enter"){


        let box=document.getElementById("terminalInput");


        let value=box.value;


        document.getElementById("output").textContent +=
        "> "+value+"\n";


        box.value="";


        if(inputCallback){

            inputCallback(value);

            inputCallback=null;

        }

    }

}




function closeTerminal(){

    document.getElementById("terminal").style.display="none";

    document.getElementById("editorPage").style.display="block";

}





function saveCode(){

    localStorage.setItem(

        "pyios_code",

        document.getElementById("code").value

    );


    alert("Code saved!");

}




window.onload=function(){


let saved=
localStorage.getItem("pyios_code");


if(saved){

document.getElementById("code").value=saved;

}


}
 



function downloadCode(){


let text=
document.getElementById("code").value;


let blob=
new Blob([text],
{
type:"text/plain"
});


let url=
URL.createObjectURL(blob);


let a=document.createElement("a");


a.href=url;

a.download="main.py";

a.click();


URL.revokeObjectURL(url);


}
