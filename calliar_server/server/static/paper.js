/*
variables
*/

var canvas;
var mousePressed = false;
var curr_img;
var currStroke = "";
var currSketch = [];
var allPaths = [];
const colors = ['black', 'red', 'blue', 'green', 'orange', 'brown', 'purple']
var oldImageName;
var newImageName;
var numImages;
var procNumImages;
var readonlyInput;
var input;
var ctr = 0; 
var paper; 
var strokeWidth = 3;

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

function addRaster(imageName)
{
    var raster = new paper.Raster({source: "/static/images/"+imageName})
    
    var w, h;
    raster.onLoad = function ()
    {
        raster.opacity = 0.3
        h = raster.width;
        w = raster.height;

        const scale = 600;
        if (w > h){
            h = parseInt((h/w) * scale);
            w = scale;
        }else{
            w = parseInt((w/h) * scale);
            h = scale; 
        }
        raster.fitBounds(paper.view.bounds)
        curr_img = raster.image
    };

}
function addImage(imageName)
{
    addRaster(imageName)
    var text =((imageName).split('.')[0]).trim()
    newImageName = text+'.jpg'
    input.value  = text;
    text = preprocess(text)[1]
    readonlyInput.value  = text;
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
    procNumImages = response.proc_num_images
    document.getElementById("ctr").innerHTML = 'You processed '+ctr+ ', remaining images '+numImages+', total processed images '+procNumImages;
    return response.image_path
}

async function start() {
    var slider = document.getElementById('myRange');
    readonlyInput = document.getElementById("text-readonly");
    input = document.getElementById("text");
    paper.install(window);
    paper.setup('canvas');
    paper.Raster.prototype.rescale = function(width, height) {
        this.scale(width / this.width, height / this.height);
    }
    // Create a simple drawing tool:
    var tool = new Tool();
    var path;

    // Define a mousedown and mousedrag handler
    tool.onMouseDown = function(event) {
        // If we produced a path before, deselect it:
        if (path) {
            path.selected = false;
        }
        
        path = new Path({
            segments: [event.point],
            strokeColor: colors[currSketch.length % colors.length],
            strokeWidth: strokeWidth,
            fullySelected: true
        });
        
    }

    tool.onMouseDrag = function(event) {
        path.add(event.point);
    }

    tool.onMouseUp = function(event) {            
        // When the mouse is released, simplify it:
        if (path.segments.length > 1)
            path.simplify();
            
        path.fullySelected = true;
        currStroke = path.exportSVG().getAttribute("d")

        const currChar = readonlyInput.value.charAt(currSketch.length * 2)
        if (currChar == "")
        {
            path.remove();
            alert("cannot add empty characters!")
        }
        else{
            console.log(currStroke)
            currSketch.push({[currChar]:currStroke})
            allPaths.push(path)
            readonlyInput.focus();
            readonlyInput.setSelectionRange(0, currSketch.length * 2);

        }

}

    // addImage('https://www.namearabic.com/thumbs/Thuluth/Aysha-462-400.jpg')
    oldImageName = getImageUrl()
    addImage(oldImageName)

    slider.onchange  = function() {
        strokeWidth = parseInt(this.value);
    };



    $(input).change(function(e){
        text = input.value.trim()
        newImageName = text+'.jpg'
        text = preprocess(text)[1]
        readonlyInput.value  = text;
    })

    
}

function undo() {
    const lastStrokeIdx = allPaths.length - 1;
    if (allPaths.length >= 1){
        allPaths[lastStrokeIdx].remove();
        currSketch.splice(-1, 1)
        allPaths.splice(-1, 1)
    }
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
        document.getElementById("ctr").innerHTML = 'You processed '+ctr+ ', remaining images '+numImages+', total processed images '+procNumImages;
    }
    else{
        alert('something is wrong!')
    }
    currStroke = []
    currSketch = []
}

function clearCanvas()
{
    paper.project.activeLayer.removeChildren();
    currStroke = []
    currSketch = []
    allPaths  = []
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
    addRaster(oldImageName);
}