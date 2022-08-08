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

function getPoints(path){
    var points = []
    var segments = path.segments

    for(i = 0; i< segments.length; i++){
        points.push([segments[i].point.x, segments[i].point.y])
    }
    return points
}