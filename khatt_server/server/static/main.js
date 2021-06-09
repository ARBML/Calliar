/*
variables
*/

var canvas;
var mousePressed = false;
var curr_img;
var currStroke = [];
var currSketch = [];
const colors = ['black', 'red', 'blue', 'green', 'orange', 'brown', 'purple']
var oldImageName;
var newImageName;
var numImages;
var readonlyInput;
var input;
var ctr = 0; 

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

function preprocess(name)
{
    var text = name;
    const diacritics = "[ًٌٍَُِّْ]"
    const numbers = '0123456789'
    for (i = 0; i < diacritics.length; i++) 
    {
        text = text.replace(diacritics[i], '')
    }

    for (i = 0; i < numbers.length; i++) 
    {
        text = text.replaceAll(numbers[i], '')
    }
    var outText = ""
    for (i = 0; i < text.length; i++) 
    {
        if (text[i] == " ")
            continue

            if (text[i] in map_chars)
            if (i < text.length - 1 && text[i] == "\u0643") // if we get kaf at the end 
            {
                if (text[i+1] != ' ')
                    outText += '\uFEDB'
                else
                outText += map_chars[text[i]].join(" ") 
            }
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
        var text =((imageName).split('.')[0]).trim()
        newImageName = text+'.jpg'
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
    response = JSON.parse(xmlHttp.response)
    numImages = response.num_images
    document.getElementById("ctr").innerHTML = 'You processed '+ctr+ ', remaining images '+numImages;
    return response.image_path
}

async function start() {
   
    canvas = new fabric.Canvas('canvas');
    canvas.backgroundColor = '#ffffff';
    canvas.isDrawingMode = 0;
    canvas.freeDrawingBrush.color = "black";
    canvas.freeDrawingBrush.width = 10;

    canvas.renderAll();

    // addImage('https://www.namearabic.com/thumbs/Thuluth/Aysha-462-400.jpg')
    oldImageName = getImageUrl()
    addImage(oldImageName)

    //setup listeners 
    canvas.on('mouse:up', function(e) {
        mousePressed = false
        const currChar = readonlyInput.value.charAt(currSketch.length * 2)
        if (currChar == "")
        {
            const objects = canvas.getObjects();
            const lastStrokeIdx = objects.length - 1;
            if (objects.length > 1){
                canvas.remove(objects[lastStrokeIdx]);
            }
            alert("cannot add empty characters!")
        }
        else{
            currSketch.push({[currChar]:currStroke})
            canvas.freeDrawingBrush.color = colors[currSketch.length % colors.length];
            readonlyInput.focus();
            readonlyInput.setSelectionRange(0, currSketch.length * 2);
            currStroke =[]
            console.log(currSketch)

        }
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
    slider.onchange  = function() {
        canvas.freeDrawingBrush.width = this.value;
    };

    readonlyInput = document.getElementById("text-readonly");
    input = document.getElementById("text");

    $(input).change(function(e){
        text = input.value.trim()
        newImageName = text+'.jpg'
        text = preprocess(text)[1]
        readonlyInput.value  = text;
    })

    
}

function undo() {
    const objects = canvas.getObjects();
    const lastStrokeIdx = objects.length - 1;
    if (objects.length > 1){
        canvas.remove(objects[lastStrokeIdx]);
        currSketch.splice(-1, 1)
    }
    console.log(currSketch)
    // update selection
    readonlyInput.focus();
    readonlyInput.setSelectionRange(0, currSketch.length * 2);
        
}

function save() {
    if(currSketch.length != readonlyInput.value.split(" ").length)
    {
        console.log(readonlyInput.value.split(" "))
        console.log(currSketch)
        alert('sketch size is not the same as the text chars!')
        return 
    }
    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://172.16.100.199:8000/endpoint/', false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        sketch: currSketch,
        oldImageName:oldImageName,
        newImageName:newImageName
    }));
    const response = JSON.parse(xhr.response)

    if (response.result == true)
    {
        next()
        ctr += 1;
        document.getElementById("ctr").innerHTML = 'You processed '+ctr+ ', remaining images '+numImages;
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
    oldImageName = getImageUrl()
    addImage(oldImageName)
}

/*
clear the canvs 
*/
function erase() {
    clearCanvas();
    canvas.add(curr_img);
}