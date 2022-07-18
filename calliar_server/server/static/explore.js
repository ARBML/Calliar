/*
variables
*/
var canvas;
var paper; 
var curr_img;
var strokeWidth = 3;
var currJsonId = 0;
var Strokeindex = 0;
var paths = [];
var colors = ['#7fc97f', '#beaed4', '#fdc086', '#008ecc', '#386cb0', '#f0027f', '#bf5b16', '#666666']
var w = 600;
var h = 600;
var drawing = false;
var readonlyInput;
var speed = 2;


var canvas = Raphael('canvas', '600px', '600px');
canvas.setViewBox(0,0,w,h);

var animatePath = function(paths) {
    color = colors[randomNumber(0, colors.length)]
    var line = canvas.path(paths[0]).attr({
        stroke: color,
        'stroke-opacity': 0,
    });
  
    var rand = Date.now();
    line.node.id = 'path'+rand;
    $('#'+line.node.id).css("transform", "translate(30,7)");
    var length = line.getTotalLength();
    var prev_path;
    $('#'+line.node.id).animate({
        'to': 1}, {
        duration: parseInt(length*speed),
        step: function(pos, fx) {
            var offset = length * fx.pos;
            
            var subpath = line.getSubpath(0, offset);
            if (prev_path != null)
            {
                prev_path.remove();
            }
            
            prev_path = canvas.path(subpath).attr({
                'stroke-width': strokeWidth,
                stroke: color
            });


        },
        complete: function(){
            if (paths.length > 0){
            animatePath(paths.slice(1))
            }
            else{
                enableBtns()
            drawing = false
            }
            
            Strokeindex += 1;
            readonlyInput.focus();
            readonlyInput.setSelectionRange(0, 2*Strokeindex);
        }
    });

};
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function getJsonList(){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", '/explore/list-json?', false ); // false for synchronous request
    xmlHttp.send( null );
    response = JSON.parse(xmlHttp.response)
    return response.json_names
}

function getJsonUrl(id = undefined){

    if(id){
        currJsonId = id
    }

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", '/explore/next-json?id='+currJsonId, false ); // false for synchronous request
    xmlHttp.send( null );
    response = JSON.parse(xmlHttp.response)
    currJsonId = parseInt(response.id)
    return response.json_path
}
function disableBtns(){  
    $('button').prop('disabled', true);
    $(':radio').prop('disabled', true);
}

function enableBtns(){
    $('button').prop('disabled', false);
    $(':radio').prop('disabled', false);
}
function generateNext(){
    currJsonId += 1
    generate()
}

function generatePrev(){
    currJsonId -= 1
    generate()
}

function setImage(w, h){
    const scale = 600;
    if (w > h){
        h = parseInt((h/w) * scale);
        w = scale;
    }else{
        w = parseInt((w/h) * scale);
        h = scale; 
    }

    cx = 300
    cy = 300 

    canvas.image("/static/processed_images/"+imageName, cx - w/2, cy - h/2, w, h).attr({
        opacity: .3,
    });
}
function addRaster(imageName)
{
    image_url = "/static/processed_images/"+imageName;
    const img = new Image();
    img.src = image_url
    img.onload = function() { setImage(this.width, this.height); }
}

function generate(id = undefined) {

    canvas.clear();
    Strokeindex = 0;

    disableBtns()
    drawing = true
    json_path = getJsonUrl(id = id)
    json_name = json_path.split('.json')[0]
    text = preprocess(json_name)[1]
    readonlyInput.value  = text;

    imageName = json_name+'.jpg' 
    addRaster(imageName)

    $.getJSON('/static/data/'+json_path , function(data) {
        paths = []
        for (var char in data){
            for (var key in data[char]){
                paths.push(data[char][key]); 
            }
        }
        animatePath(paths)
    });
}

async function start() {

    generate()

};


function onClick(id){
    generate(id)
}
function createBtn(content, id = 0){
    return `<button id = ${id} type="button" class="btn btn-light" onclick="onClick(this.id)">${content}</span>`
}

window.onload = (event) => {
    readonlyInput = document.getElementById("text-readonly");
    strokeWidth = document.getElementById('slider').value
    canvas.clear();

    $( "#slider" ).on('change', function move(){
            strokeWidth = parseInt(this.value);
     });

    console.log('page is fully loaded');
    const jsonList = getJsonList()

    for (var i=0; i<jsonList.length; i++) {
        document.querySelector('#jsonList').innerHTML += createBtn(jsonList[i], id = i)
    }

};

function speedUp(){
    speed = 1 
}

function speedDown(){
    speed = 4
}

function speedReset(){
    speed = 2
}
