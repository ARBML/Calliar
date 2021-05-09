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

function preprocess(name)
{
    var text = name;
    const diacritics = "[ًٌٍَُِّْ]"
    for (i = 0; i < diacritics.length; i++) 
    {
        text = text.replace(diacritics[i], '')
    }

    var outText = ""
    for (i = 0; i < text.length; i++) 
    {
        if (text[i] in map_chars)
            if (text[i] == "\u0643" && i != text.length - 1)
                outText += text[i]+'ـ'
            else
                outText += map_chars[text[i]].join(" ")
        else{

                outText += text[i]
        }            
        if (i != text.length - 1)
            outText +=  " ، "
            
    }

    return [text, outText]
}
function addImage(imageName)
{
    fabric.Image.fromURL("/static/images/"+imageName, function(img) {
        img.opacity = 0.5
        img.set({
            left: 0,
            top: 0,
          });
        img.scaleToHeight(500);
        img.scaleToWidth(500);
        curr_img = img
        canvas.add(curr_img)
        console.log(map_chars['أ'])
        var text =(imageName.split("_")[1]).split('.')[0]
        text = preprocess(text)[1]
        document.getElementById("text").value  = text;
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
    canvas.isDrawingMode = 0;
    canvas.freeDrawingBrush.color = "black";
    canvas.freeDrawingBrush.width = 10;

    canvas.renderAll();

    // addImage('https://www.namearabic.com/thumbs/Thuluth/Aysha-462-400.jpg')
    imageName = getImageUrl()
    addImage(imageName)

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
    var slider = document.getElementById('myRange');
    slider.oninput = function() {
        canvas.freeDrawingBrush.width = this.value;
    };
    
}

function save() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://127.0.0.1:8000/endpoint/', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        value: currSketch,
        imageName:imageName
    }));
    
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
    clearCanvas();
    imageName = getImageUrl()
    addImage(imageName)
}

/*
clear the canvs 
*/
function erase() {
    clearCanvas();
    canvas.add(curr_img);
}