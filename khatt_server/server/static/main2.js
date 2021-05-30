/*
variables
*/

var canvas;
var mousePressed = false;
var curr_img;
var currStroke = [];
var currSketch = [];
const colors = ['black', 'red', 'blue', 'green', 'orange', 'brown', 'purple']
var imageName;
var input;

/*
record the current drawing coordinates
*/
function recordCoor(event) {
    var pointer = canvas.getPointer(event.e);
    var x = pointer.x;
    var y = pointer.y;
    // console.log(x)
    // document.getElementById("x").innerHTML =""+x;
    // document.getElementById("y").innerHTML =""+y;

    if (x >= 0 && y >= 0 && mousePressed) {
        currStroke.push([x, y])
    }
}

function addImage(imageName)
{
    fabric.Image.fromURL("/static/larger_images/"+imageName, function(img) {
        img.opacity = 0.5
        img.set({
            left: 0,
            top: 0,
          });
        curr_img = img
        canvas.add(curr_img)
        canvas.setHeight(img.height);
        canvas.setWidth(img.width);

    });
}
/*
load the model
*/


function getImageUrl(){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", '/endpoint/next-image', false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText
}

async function start() {
   
    canvas = new fabric.Canvas('canvas');
    canvas.backgroundColor = '#ffffff';

    canvas.renderAll();

    // addImage('https://www.namearabic.com/thumbs/Thuluth/Aysha-462-400.jpg')
    imageName = getImageUrl()
    addImage(imageName)
    input = document.getElementById("text");

    input.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
         event.preventDefault();
         document.getElementById("save").click();
        }
    });
}

function save() {
    text = document.getElementById('text').value
    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'endpoint2/', false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        text: text,
        imageName: imageName
    }));
    const response = JSON.parse(xhr.response)

    if (response.result == true)
    {
        next()
    }
    else{
        alert('something is wrong!')
    }
    currStroke = []
    currSketch = []
}

function clearCanvas()
{
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    currStroke = []
    currSketch = []
}
function next() {
    input.value = ""
    clearCanvas();
    imageName = getImageUrl()
    addImage(imageName)
    input.focus()
    
}

/*
clear the canvs 
*/
function erase() {
    clearCanvas();
    canvas.add(curr_img);
}