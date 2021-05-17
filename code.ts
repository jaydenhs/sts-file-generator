figma.showUI(__html__);
figma.ui.resize(460, 350);

let coverPage: PageNode;
let coverInstance: InstanceNode;
let frame: FrameNode;
let selection: SceneNode;
let component: ComponentNode;

figma.ui.onmessage = async (msg) => {
  if (msg.type === "finish") {
    // // capture selection before creating page, or selection will be negated
    // selection = figma.currentPage.selection[0];
    // component = figma.currentPage.selection[0];
    // console.log(component);
    // console.log(selection.key);
    // const imageArr = await selection.exportAsync({ format: "PNG" });
    // var hash = figma.createImage(imageArr).hash;
    // // viewport
    // var viewport = figma.viewport.center;
    // // create rectangle and set image fill
    // const rect = figma.createRectangle();
    // // set x and y coordinates with viewport values
    // rect.x = viewport.x;
    // rect.y = viewport.y;
    // rect.resize(500, 500);
    // // set type to IMAGE and set fill with image hash data
    // rect.fills = [{ type: "IMAGE", scaleMode: "FILL", imageHash: hash }];
    // // add image to Figma
    // figma.currentPage.appendChild(rect);

    createPage();
    insertCoverComponent();

    // insertMockup();
  }
  figma.closePlugin();
};

async function getCover() {
  // get cover component by its key
  // obtained from console.logging a selected instance
  const componentKey = "02b9b056225fd1f3e40fd77be519f11198e65cdf";
  const component = await figma.importComponentByKeyAsync(componentKey);
  return component;
}

async function insertCoverComponent() {
  let coverComponent = await getCover();
  coverInstance = coverComponent.createInstance();
  coverPage.appendChild(coverInstance);

  // set cover page's background color to be the same as the cover's
  // saves the grunt work of having to update the hex code if the cover changes
  // default to dark grey if the cover instance is not a solid color
  let bgColor = hexToRgb("#1E1E1E");
  if (coverInstance.backgrounds[0].type === "SOLID") {
    bgColor = coverInstance.backgrounds[0].color;
  }
  coverPage.backgrounds = [
    {
      type: "SOLID",
      color: {
        r: bgColor.r,
        g: bgColor.g,
        b: bgColor.b,
      },
    },
  ];

  // zoom into the cover, or else it'll be larger than the user's viewport
  const nodes = [];
  nodes.push(coverInstance);
  figma.viewport.scrollAndZoomIntoView(nodes);
}

function createPage() {
  coverPage = figma.createPage();
  coverPage.name = "Cover";
  figma.currentPage = coverPage;

  // insert new page at the top of the root (first page)
  figma.root.insertChild(0, coverPage);
}

// function insertMockup() {
//   // Selected node must be a frame to work
//   if (selection.type !== "FRAME") {
//     figma.ui.postMessage({
//       type: "error",
//       value: "select a frame to render into",
//     });
//     return "error";
//   }

//   var mask = figma.createRectangle();
//   mask.resize(934, 751);
//   mask.isMask = true;
//   frame.appendChild(mask);

//   //* eventually want to export as image for easier adjusting
//   //* https://www.figma.com/plugin-docs/api/FrameNode/#exportasync
//   var mockup = selection.clone();
//   var scale_factor = 934 / mockup.width;
//   mockup.rescale(scale_factor);
//   mockup.x = 120.33;
//   mockup.y = 83.95;
//   frame.appendChild(mockup);
// }

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : null;
}
