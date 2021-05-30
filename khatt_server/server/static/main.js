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
var readonlyInput;
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

function preprocess(name)
{
    var text = name;
    const diacritics = "[ًٌٍَُِّْ]"
    const numbers = '0123456789'
    for (i = 0; i < diacritics.length; i++) 
    {
        text = text.replace(diacritics[i], '')
        text = text.replace(numbers[i], '')
    }

    var outText = ""
    for (i = 0; i < text.length; i++) 
    {
        if (text[i] == " ")
            continue
        console.log(text[i])
        if (text[i] in map_chars)
            if (text[i] == "\u0643" && i != text.length - 1)
                outText += '\uFEDB'
            else
                outText += map_chars[text[i]].join(" ")
        else{

                outText += text[i]
        }            
        if (i != text.length - 1)
            outText +=  " "
            
    }

    return [text, outText]
}
function addImage(imageName)
{
    fabric.Image.fromURL("/static/larger_images/"+imageName, function(img) {
        img.opacity = 0.5
        img.set({
            left: 0,
            top: 0,
          });
        
        var w, h;
        h = img.height;
        w = img.width;

        const scale = 600;
        if (img.width > img.height){
            h = parseInt((h/w) * scale);
            w = scale;
        }else{
            w = parseInt((w/h) * scale);
            h = scale; 
        }
        
        img.scaleToHeight(h);
        img.scaleToWidth(w);
        canvas.add(img)
        canvas.setHeight(h);
        canvas.setWidth(w);
        curr_img = img
        console.log(imageName)
        var text =(imageName).split('.')[0]
        input.value  = text;
        text = preprocess(text)[1]
        readonlyInput.value  = text;
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
        const currChar = readonlyInput.value.charAt(currSketch.length * 2)
        currSketch.push({[currChar]:currStroke})
        canvas.freeDrawingBrush.color = colors[currSketch.length % colors.length];
        readonlyInput.focus();
        readonlyInput.setSelectionRange(0, currSketch.length * 2);
        currStroke =[]
    });
    canvas.on('mouse:down', function(e) {
        mousePressed = true
        recordCoor(e)
    });
    canvas.on('mouse:move', function(e) {
        recordCoor(e)
    });

    canvas.isDrawingMode = 1;
    var slider = document.getElementById('myRange');
    slider.onreadonlyInput = function() {
        canvas.freeDrawingBrush.width = this.value;
    };

    readonlyInput = document.getElementById("text-readonly");
    input = document.getElementById("text");

    $(input).change(function(e){
        text = input.value
        imageName = text+'.jpg'
        text = preprocess(text)[1]
        readonlyInput.value  = text;
    })

    
}

function undo() {
    const objects = canvas.getObjects();
    const lastStrokeIdx = objects.length - 1;
    console.log(currSketch.length)
    if (objects.length > 1){
        canvas.remove(objects[lastStrokeIdx]);
        currSketch.splice(-1, 1)
    }
    console.log(currSketch.length)
    // update selection
    readonlyInput.focus();
    readonlyInput.setSelectionRange(0, currSketch.length * 2);
        
}

function save() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://172.16.100.199:8000/endpoint/', false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        sketch: currSketch,
        sketchName:imageName
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