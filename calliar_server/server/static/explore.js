/*
variables
*/
var canvas;
var paper; 
var strokeWidth = 3;
var currJsonId = 0;
var index = 0 ;
var paths = [];
var colors = ['#7fc97f', '#beaed4', '#fdc086', '#008ecc', '#386cb0', '#f0027f', '#bf5b16', '#666666']
var w = 600;
var h = 600;
var drawing = false;
var canvas = Raphael('canvas', w+'px', h+'px');
canvas.setViewBox(0,0,w,h);


var animatePath = function(paths) {
    color = colors[randomNumber(0, colors.length)]
    document.getElementById("generate").disabled = true;
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
        duration: parseInt(length*2),
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
            document.getElementById("generate").disabled = false;
            drawing = false
            }
            
            index += 1;
        }
    });

};
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function getJsonUrl(){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", '/explore/next-json?id='+currJsonId, false ); // false for synchronous request
    xmlHttp.send( null );
    response = JSON.parse(xmlHttp.response)
    currJsonId = parseInt(response.id)
    return response.json_path
}

function next() {
    canvas.clear();
    drawing = true
    json_path = getJsonUrl()

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

    paper.install(window);
    paper.setup('myCanvas');

    btn = document.getElementById("generate")
    btn.addEventListener("click", function onClick(){
        next()
    });

    strokeWidth = document.getElementById('slider').value
    canvas.clear();


    $(document).keydown(function(event) {
        if(event.key == 'ArrowRight' && drawing != true){
            currJsonId += 1
            next()
        }
        if (event.key == 'ArrowLeft' && drawing != true) {
            currJsonId -= 1
            next()
        }
    });

    next()

    slider.onchange  = function() {
        strokeWidth = parseInt(this.value);
    };

    $(input).change(function(e){
        text = input.value.trim()
        newImageName = text+'.jpg'
        text = preprocess(text)[1]
        readonlyInput.value  = text;
    })

    
};