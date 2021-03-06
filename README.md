# inshape🔴🟠🟡
[![](https://img.shields.io/badge/open-GitHub%20Pages-blueviolet)](https://gforien.github.io/inshape/)
[![](https://img.shields.io/badge/open-GitHub%20repo-blue)](https://github.com/gforien/inshape)

#### InShape is a Miro plugin which uses image processing and OCR for converting a PNG/JPEG diagram into coloured shapes and text.
#### ☄ [Full Demo](https://gforien.github.io/inshape/static/demo.html?./images/osi.png)


## Stack
![](https://img.shields.io/badge/NodeJS-✓-blue)
![](https://img.shields.io/badge/Express-✓-blue)
![](https://img.shields.io/badge/HTML%20%26%20CSS-✓-blue)
![](https://img.shields.io/badge/client--side%20JavaScript-✓-blue)
![](https://img.shields.io/badge/image--js-✓-blue)
![](https://img.shields.io/badge/Tesseract.js-✓-blue)
![](https://img.shields.io/badge/Miro%20SDK-✓-blue)

![](./static/images/demo.gif)
*This is **not** real-time. Processing this image takes ~7 sec.*
<!---
    [Edit in JSFiddle](https://jsfiddle.com/sdljdsfl)
--->

## Features
The three main features are
- shape recognition i.e. get a Region of Interest (ROI) and compute surface ration
- color extraction  i.e  get the RGB histograms from the ROIs and extract most dominant color
- optical character recognition (OCR)  i.e. send a ROI to Tesseract.js and voilà !

![](./static/images/osi_extracted.png)


## Build yourself
See [here](BUILDING.md).

---
#### Gabriel FORIEN <br> 5TC - INSA Lyon
![](https://upload.wikimedia.org/wikipedia/commons/b/b9/Logo_INSA_Lyon_%282014%29.svg)
