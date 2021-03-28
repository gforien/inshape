"use strict";
// const urlParams = new URLSearchParams(window.location.search);
// let imagePath = urlParams.get('image');
/***************************************
 *        init Tesseract Thread        *
 ***************************************/
const worker = Tesseract.createWorker({
  // logger: m => console.log(m)
});


/***************************************
 *        rgb to hex conversion        *
 ***************************************/
const componentToHex = (c) => {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
const rgbToHexString = (r, g, b) => {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
const insertAfter = (node, newNode) => {
  node.parentNode.insertBefore(newNode, node.nextSibling);
}


/*******************************
 *        main function        *
 *******************************/
const imageURLToMiroShapes = async (url) => {

  // let url = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/OSI_Model_v1.svg/1000px-OSI_Model_v1.svg.png";
  // let url = "https://gforien.github.io/inshape/shapes_colors.jpg";
  // let image = await IJS.Image.load(document.getElementById('color').src);
  // let image = await IJS.Image.load("https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Diagram_of_a_red_blood_cell_CRUK_467.svg/500px-Diagram_of_a_red_blood_cell_CRUK_467.svg.png");
  // let image = await IJS.Image.load("https://gforien.github.io/inshape/shapes_colors.jpg");

  // IMAGE PROCESSING
  let image = await IJS.Image.load(url);
  let imageWB = image.grey();
  let gaussian= imageWB.gaussianFilter({radius:4});
  let mask= gaussian.mask({threshold: 0.90});
  let roiManager = imageWB.getRoiManager();
  roiManager.fromMask(mask);

  let rois = roiManager.getRois({
    // positive:false,                  // ???
    minSurface:10,
    // maxWidth: image.width-1,         // filter ROIs that occupy all image
    // maxHeight: image.height-1        // filter ROIs that occupy all image
    // minWidth:999
  });

  // output original image
  document.getElementById('original_image_anchor').src = imageWB.toDataURL();
  
  // output count of identified ROIs
  console.log(`${rois.length} shapes detected`);
  document.getElementById('n_shapes_anchor').innerHTML = `2️⃣ Regions Of Interest → we detect ${rois.length} ROIs`

  // output an image of the ROIs
  let painted = roiManager.paint({
    distinctColor: true,
      alpha: 200,                      // transparency of the painted layer
      positive:false,                  // ???
      minSurface:10,
      maxWidth: image.width-1,         // filter ROIs that occupy all image
      maxHeight: image.height-1        // filter ROIs that occupy all image
  });
  document.getElementById('rois_image_anchor').src = painted.toDataURL();

  // Tesseract initialization
  // (!) All the performance problems come from here
  await worker.load();
  await worker.loadLanguage('eng'); //eng+fra
  await worker.initialize('eng');

  let shapes = [];
  for (let roi of rois) {
    let row = document.createElement("tr");
    let surfaceRatio = roi.surface / (roi.height * roi.width);
    let isSurfaceRatioOK = (surfaceRatio > 0.9 && surfaceRatio != 1);
    // if (!isSurfaceRatioOK) continue;


    // 1. Cropped image
    let croppedImage = image.crop({x: roi.minX, y: roi.minY, width: roi.width, height: roi.height });
    row.innerHTML += `<td>
      <img src="${croppedImage.toDataURL()}" style="border: 1px solid black; max-width: 300px; max-height: 100px;" />
     </td>
     <td>
       ${croppedImage.width}x${croppedImage.height} px
     </td>`;


    // 2. Shape recognition (rectangle or circle)
    // Compute circularity coefficient : if it's over 80% it's a rectangle, else it's a circle
    // shapeType is an integer : 3 for a rectangle, 4 for a circle
    let shapeType = 0;
    let shapeTypeStr = "";
    if (surfaceRatio >= 0.8) {
      shapeTypeStr = "rectangle";
      shapeType = 3;
    }
    else {
      shapeTypeStr = "circle";
      shapeType = 4;
    }
    // console.log(`surfaceRatio = ${(surfaceRatio * 100).toFixed(0)}% → it's a ${shapeTypeStr}`);
    row.innerHTML += `
    <td>
      ${(surfaceRatio * 100).toFixed(0)}%
    </td>
    <td>
      it's a ${shapeTypeStr}
    </td>`;
  


    // 3. Dominant color extraction
    // Get the RGB histograms maximum i.e. the dominant intensity of red, green, and blue
    // Then, convert this to a hexadecimal string e.g. #a1b2c3
    let histograms = croppedImage.getHistograms();
    let dominantColorRGB = [];
    for (let channel of histograms) {
      // (!) if there are 2 maxima, it returns only the first
      dominantColorRGB.push(channel.indexOf(Math.max(...channel)));
      // console.log(`in channel ${channel}, max = ${Math.max(...channel)} = index ${channel.indexOf(Math.max(...channel))}`);
    }
    let dominantColorHexString = rgbToHexString(...dominantColorRGB);
    // console.log("dominant color: "+dominantColorHexString);
    row.innerHTML += `
    <td style="border-right:hidden; padding-right:0px">
      <div style="background-color:${dominantColorHexString}; border: 1px solid black; width: 30px; height: 30px; display: inline-block;">
      </div>
    </td>
    <td style="padding-left:0px">
      <b>${dominantColorHexString}</b>
    </td>`;
  

    // Tesseract recognizes text in the cropped image
    let OCR_Rectangle = {
      left: roi.minX,
      top: roi.minY,
      width: roi.width,
      height: roi.height
    };
    // console.log(OCR_Rectangle)
    let OCR = await worker.recognize(url, { rectangle: OCR_Rectangle });
    OCR.data.text = OCR.data.text.replace('’','');
    // OCR.data.text = OCR.data.text.replace('↵',' ');
    // console.log(`text: ${OCR.data.text}`)
    row.innerHTML += `<td>${OCR.data.text}</td>`;
  
    let miroShape = {
      type: 'shape',
      text: OCR.data.text,
      x: roi.minX,
      y: roi.maxX,
      width: roi.width,
      height: roi.height,
      style: {
        backgroundColor: dominantColorHexString,
        shapeType: shapeType,
        fontFamily: 'OpenSans',
        fontSize: 22
      }
    };
    if(isSurfaceRatioOK) {
      shapes.push(miroShape);
    }
    row.innerHTML += `
    <td>
      <div style="width:300px; word-break:break-word; font-size:11; font-family:Consolas">
        ${JSON.stringify(miroShape)}
      </div>
    </td>`;

    console.log(`${row}`);

    // Append to the HTML table
    if (isSurfaceRatioOK) {
      console.log("append here")
      insertAfter(document.getElementById("table_anchor"), row);
    }
    else {
      console.log("append there")
      insertAfter(document.getElementById("filtered_out_table_anchor"), row);
    }
  }
  
  await worker.terminate();
  
  return shapes
}

/*************************
 *        wrapper        *
 *************************/
document.addEventListener("DOMContentLoaded", async () => {

  let t0 = performance.now()

  let imagePath = window.location.search.substring(1);
  console.log(`Input file: ${imagePath}`);
  
  let miroObjectJSON = await imageURLToMiroShapes(imagePath);

  document.getElementById("spinner").style.visibility = "hidden";
  let timeDuration = ((performance.now()-t0)/1000).toFixed(2);
  toastr.success("", `Image processed in ${timeDuration} sec`, {closeButton: true, timeOut: "1000"});

  console.log(miroObjectJSON);
});