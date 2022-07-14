/*
variables
*/
var canvas;
var paper; 
var curr_img;
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
                enableBtns()
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
function disableBtns(){
    $('button').prop('disabled', true);
}

function enableBtns(){
    $('button').prop('disabled', false);
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
    console.log(w)
    console.log(h)

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
    

    // var w, h;
    // raster.onLoad = function ()
    // {
    //     console.log('loaded')
    //     raster.opacity = 0.3
    //     h = raster.width;
    //     w = raster.height;

    //     const scale = 600;
    //     if (w > h){
    //         h = parseInt((h/w) * scale);
    //         w = scale;
    //     }else{
    //         w = parseInt((w/h) * scale);
    //         h = scale; 
    //     }
    //     raster.fitBounds(paper.view.bounds)
    //     console.log(raster.image)
    //     curr_img = raster.image
    // };

}

function generate() {
    canvas.clear();
    $('button').prop('disabled', true);
    drawing = true
    json_path = getJsonUrl()
    imageName = json_path.split('.json')[0]+'.jpg' 
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

    paper.install(window);
    paper.setup('myCanvas');
    paper.Raster.prototype.rescale = function(width, height) {
        this.scale(width / this.width, height / this.height);
    }
    strokeWidth = document.getElementById('slider').value
    canvas.clear();


    $(document).keydown(function(event) {
        if(event.key == 'ArrowRight' && drawing != true){
            
        }
        if (event.key == 'ArrowLeft' && drawing != true) {
            currJsonId -= 1
            generate()
        }
    });

    $( "#slider" ).on('change', function move(){
            strokeWidth = parseInt(this.value);
     });

    generate()

    
    
};