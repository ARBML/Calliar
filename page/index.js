var w = 600;
var h = 600;
var canvas = Raphael('canvas', '300px', '300px');
canvas.setViewBox(0,0,w,h);
canvas.setSize('100%', '100%');

function create_data(drawing){
    var data = []
    var new_data = []
    var x;
    var y;
    var xs = [];
    var ys = [];

    for (let i = 0; i < drawing.length; i++){
      const stroke = drawing[i];
      if (stroke.length > 1)
          for(let j = 0 ; j < stroke.length; j++){
            [x, y] = stroke[j]
            var z = 0;
            if (j == stroke.length - 1)
            {
              z = 1;
            }
                
            data.push([x, y, z])
            xs.push(x)
            ys.push(y)
          }

      else if (stroke.length == 1){
          [x, y] = stroke[0]
          data.push([x, y, 0])
          xs.push(x)
          ys.push(y)
          data.push([x, y+3, 1])
          xs.push(x)
          ys.push(y + 3)  
      }
    }

    const min_x = Math.min(...xs);
    const max_x = Math.max(...xs);

    const min_y = Math.min(...ys);
    const max_y = Math.max(...ys);

    const margin_x = (600 - max_x - min_x)/2;
    const margin_y = (600 - max_y - min_y)/2;

    var new_data = [];

    for (let i = 0; i < data.length; i++){
      [x, y, z] = data[i];
      new_data.push([x+ margin_x , y + margin_y, z])
    }

    return new_data
}
function getSvgPathFromStroke(stroke) {
    if (!stroke.length) return ""
  
    const d = stroke.reduce(
      (acc, [x0, y0]) => {
        acc.push(x0, y0)
        return acc
      },
      ["M", ...stroke[0], "Q"]
    )
  
    return d
  }


var animatePath = function(paths) {
  color = colors[randomNumber(0, colors.length)]
  // console.log(paths.length)
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
          // console.log('#'+line.node.id)
        }
        else{
          document.getElementById("generate").disabled = false;
        }
        
        index += 1;
      }
  });

};
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

var b = document.querySelector('button')
var p = [];
var total = 0;
var notFinished = true;
var next_path = 0 ;
var index = 0 ;
var paths = [];
var myVar;
var colors = ['#7fc97f', '#beaed4', '#fdc086', '#008ecc', '#386cb0', '#f0027f', '#bf5b16', '#666666']
var strokeWidth;

b.onclick = function(){
  strokeWidth = document.getElementById('slider').value
  canvas.clear();
  index = 0; 
  var full_path = "";
  var drawing = eval("stroke_"+randomNumber(0, 100));
  // drawing = stroke_3
  const data = create_data(drawing)
  var currStroke = [];
  paths = [] ;
  for(var i = 0 ; i < data.length ; i++){
      [x, y , z] = data[i]
      currStroke.push([x, y])
      if (z == 1)
      {
        const pathString = getSvgPathFromStroke(currStroke)
        full_path = full_path + pathString.join(" ");
        paths.push(pathString.join(" "))
        currStroke = [];
      }
    
  }
 
  animatePath(paths)
};