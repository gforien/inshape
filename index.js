/***************************************
 *        init Tesseract Thread        *
 ***************************************/
const worker = Tesseract.createWorker({
  logger: m => console.log(m)
});


/***************************************
 *        rgb to hex conversion        *
 ***************************************/
const componentToHex = (c) => {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
const rgbToHex = (r, g, b) => {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


/*******************************
 *        main function        *
 *******************************/
(async () => {

  let url = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/OSI_Model_v1.svg/1000px-OSI_Model_v1.svg.png";
  
  //let url = "https://gforien.github.io/inshape/shapes_colors.jpg";

  // let image = await IJS.Image.load(document.getElementById('color').src);
  // let image = await IJS.Image.load("https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Diagram_of_a_red_blood_cell_CRUK_467.svg/500px-Diagram_of_a_red_blood_cell_CRUK_467.svg.png");
  // let image = await IJS.Image.load("https://gforien.github.io/inshape/shapes_colors.jpg");

  // IMAGE PROCESSING
  let image = await IJS.Image.load(url);
  let gaussian= image.grey().gaussianFilter({radius:4});
  let mask= gaussian.mask({threshold: 0.90});
  let roiManager = image.getRoiManager();
  roiManager.fromMask(mask);         
  let rois = roiManager.getRois({positive:false, minSurface:10})
  console.log(rois.length+" shapes detected")

  // Tesseract initialization
  await worker.load();
  await worker.loadLanguage('eng'); //eng+fra
  await worker.initialize('eng');

  shapes = [];
  for (let ele of rois) {
  //rois.forEach(async (ele) => {
    console.log("ele "+ele)
  
    // coefficient c1 computes shape type (rectangle or circle)
    let shapeType = 0;
    let c1 = ele.surface / (ele.height * ele.width);
    if (c1 > 0.8) shapeType = 3; // it is a rectangle
    else shapeType = 4;     // it is a circle
    console.log("shape type: "+shapeType+" (c1 = "+c1.toFixed(2)+")");
  
    // histograms compute dominant color
    let croppedImage = image.crop({
      x: ele.minX,
      y: ele.minY,
      width: ele.width,
      height: ele.height
    });
    let histograms = croppedImage.getHistograms();
    let dominantColorRGB = histograms.map(x => x.indexOf(Math.max(...x)));
    let dominantColorHex = rgbToHex(...dominantColorRGB);
    console.log("dominant color: "+dominantColorHex);
  
    // Tesseract recognizes text in the cropped image
    let OCR_Rectangle = {
      left: ele.minX,
      top: ele.minY,
      width: ele.width,
      height: ele.height
    };
    let { data: { OCR_Text } } = await worker.recognize(url, { rectangle: OCR_Rectangle });
    console.log(OCR_Text)
  
    // OCRAD
    //console.log("OCRAD:\n"+OCRAD(croppedImage));
  
    shapes.push({
      type: 'shape',
      text: OCR_Text,
      x: ele.minX,
      y: ele.maxX,
      width: ele.width,
      height: ele.height,
      style: {
        backgroundColor: dominantColorHex,
        shapeType: shapeType}
    });
  }
  
  await worker.terminate();
  
  //let s = await miro.board.widgets.create(shapes)
  
  })();