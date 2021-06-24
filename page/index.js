var canvas = Raphael('canvas', '300', '250');

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

    const margin_x = (300 - max_x - min_x)/2;
    const margin_y = (300 - max_y - min_y)/2;

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


var animateLine = function(path, canvas, color) {
      var line = canvas.path(path).attr({
          stroke: color
      });
      var box = line.getBBox();    
      var margin = Math.max( box.width, box.height ) * 0.5 //  because white space always looks nice ;-)
      canvas.setViewBox(box.x - margin, box.y - margin, box.width + margin * 2, box.height + margin * 2);   


      var length = line.getTotalLength();
      $('path').animate({
          'to': 1}, {
          duration: parseInt(length * 2),
          step: function(pos, fx) {
              var offset = length * fx.pos;
              var subpath = line.getSubpath(0, offset);
              canvas.clear();
              canvas.path(subpath).attr({
                  'stroke-width': 2,
                  stroke: color
                });

          },
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

b.onclick = function(){

  var full_path = "";
  var drawing = eval("stroke_"+randomNumber(0, 100));
  const data = create_data(drawing)
  var currStroke = [];
  var paths = [] ;
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

  function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

  animateLine(paths, canvas, "#0198E1") 

   

};