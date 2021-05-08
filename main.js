/*
variables
*/

var canvas;
var mousePressed = false;
var curr_img;
var currStroke = [];
var currSketch = [];
const colors = ['black', 'red', 'blue', 'green', 'yellow', 'pink', 'purple']
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
async function start(cur_mode) {
   
    canvas = new fabric.Canvas('canvas');
    canvas.backgroundColor = '#ffffff';
    canvas.isDrawingMode = 0;
    canvas.freeDrawingBrush.color = "black";
    canvas.freeDrawingBrush.width = 10;

    canvas.renderAll();
    
    addImage('0.jpg')

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
    currStroke = []
    currSketch = []
}

function next() {
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    currStroke = []
    currSketch = []
    addImage('1.jpg')
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