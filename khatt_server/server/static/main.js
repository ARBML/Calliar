/*
variables
*/

var canvas;
var mousePressed = false;
var curr_img;
var currStroke = [];
var currSketch = [];
const colors = ['black', 'red', 'blue', 'green', 'yellow', 'pink', 'purple']
var imageName;
/*
record the current drawing coordinates
*/
function recordCoor(event) {
    var pointer = canvas.getPointer(event.e);
    var x = pointer.x;
    var y = pointer.y;

    
    if (x >= 0 && y >= 0 && mousePressed) {
        currStroke.push([x, y])
    }
}

function addImage(path)
{
    fabric.Image.fromURL(path, function(img) {
        img.opacity = 0.2
        img.set({
            left: 0,
            top: 0
          });
        img.scaleToHeight(300);
        img.scaleToWidth(300);
        curr_img = img
        canvas.add(img); 
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

async function start(cur_mode) {
   
    canvas = new fabric.Canvas('canvas');
    canvas.backgroundColor = '#ffffff';
    canvas.isDrawingMode = 0;
    canvas.freeDrawingBrush.color = "black";
    canvas.freeDrawingBrush.width = 10;

    canvas.renderAll();

    // addImage('https://www.namearabic.com/thumbs/Thuluth/Aysha-462-400.jpg')
    imageName = getImageUrl()
    addImage('/static/images/'+imageName)

    //setup listeners 
    canvas.on('mouse:up', function(e) {
        mousePressed = false
        currSketch.push(currStroke)
        canvas.freeDrawingBrush.color = colors[currSketch.length % colors.length];
        currStroke =[]
    });
    canvas.on('mouse:down', function(e) {
        mousePressed = true
    });
    canvas.on('mouse:move', function(e) {
        recordCoor(e)
    });
    canvas.isDrawingMode = 1;
    $('button').prop('disabled', false);
    var slider = document.getElementById('myRange');
    slider.oninput = function() {
        canvas.freeDrawingBrush.width = this.value;
    };
    
}

function save() {
    console.log(currSketch)

    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://127.0.0.1:8000/endpoint/', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    // xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhr.send(JSON.stringify({
        value: currSketch,
        imageName:imageName
    }));
    
    currStroke = []
    currSketch = []
}

function next() {
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    imageName = getImageUrl()
    currStroke = []
    currSketch = []
    addImage('/static/images/'+imageName)
}

/*
clear the canvs 
*/
function erase() {
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.add(curr_img);
    currStroke = []
    currSketch = []
}