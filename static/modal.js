"use strict";

const worker = Tesseract.createWorker({
});


const componentToHex = (c) => {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}


const rgbToHexString = (r, g, b) => {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


const imageURLToMiroShapes = async (url) => {

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

  // output count of identified ROIs
  console.log(`${rois.length} shapes detected`);

  // Tesseract initialization
  // (!) All the performance problems come from here
  await worker.load();
  await worker.loadLanguage('eng'); //eng+fra
  await worker.initialize('eng');

  let shapes = [];
  for (let roi of rois) {
    console.log(`Processing...`);

    let surfaceRatio = roi.surface / (roi.height * roi.width);
    let isSurfaceRatioOK = (surfaceRatio > 0.9 && surfaceRatio != 1);
    if (!isSurfaceRatioOK) continue;



    // 1. Cropped image
    let croppedImage = image.crop({x: roi.minX, y: roi.minY, width: roi.width, height: roi.height });


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

  
    let miroShape = {
      type: 'shape',
      text: OCR.data.text,
      x: roi.minX,
      y: roi.minY,
      width: roi.width,
      height: roi.height,
      style: {
        backgroundColor: dominantColorHexString,
        shapeType: shapeType,
        fontFamily: 10,
        fontSize: 22
      }
    };
    shapes.push(miroShape);
  }
  
  await worker.terminate();
  
  return shapes
}


document.addEventListener("DOMContentLoaded", async () => {

  let urlInput = document.getElementById('url_input');
  let okButton = document.getElementById('ok_button');
  let spinner = document.getElementById('spinner');
  let cancelButton = document.getElementById('cancel_button');

  urlInput.onchange = () => {
    console.log('onChange called !');
    okButton.disabled = false;
    okButton.style.opacity = 1;
  };

  okButton.onclick = async () => {
    okButton.disabled = true;
    okButton.style.opacity = 0.5;
    okButton.innerHTML = "Processing...";
    okButton.style.width = "140px";
    spinner.style.visibility = "visible";

    console.log("Launch image processing");
    let json = await imageURLToMiroShapes(urlInput.value);
    console.log('Done !');
    // let json = await imageURLToMiroShapes('https://gforien.github.io/inshape/static/images/osi.png');
    console.log(json);
    await miro.board.widgets.create(json);
    miro.showNotification("image converted into shapes")
    miro.board.ui.closeModal();
  };

  cancelButton.onclick = () => {
    console.log('Closing modal');
    miro.showNotification("cancelled")
    miro.board.ui.closeModal()
  };

});

