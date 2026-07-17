let pyodide;

let waitingInput=false;

let inputResolve;


async function start(){

pyodide=await loadPyodide();

console.log("Python ready");

}


start();



function runCode(){


document.getElementById("terminal").style.display="flex";

document.getElementById("editorPage").style.display="none";


let code=document.getElementById("code").value;


pyodide.setStdout({

batched:(msg)=>{

document.getElementById("output").textContent += msg+"\n";

}

});



pyodide.setStdin({

stdin:()=>{

return new Promise(resolve=>{

inputResolve=resolve;

});

}

});



document.getElementById("output").textContent="";


pyodide.runPythonAsync(code)

.catch(err=>{

document.getElementById("output").textContent+=
"\nERROR:\n"+err;

});


}



function sendInput(e){

if(e.key==="Enter"){

let input=e.target.value;


document.getElementById("output").textContent +=
"> "+input+"\n";


e.target.value="";


if(inputResolve){

inputResolve(input);

inputResolve=null;

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


alert("Saved");

}



window.onload=()=>{

let saved=localStorage.getItem("pyios_code");

if(saved){

document.getElementById("code").value=saved;

}

}




function downloadCode(){

let file=new Blob(

[
document.getElementById("code").value
],

{
type:"text/python"
}

);


let link=document.createElement("a");

link.href=URL.createObjectURL(file);

link.download="main.py";

link.click();


}
