// notes:
// move image with crop
// can't programatically set frame as thumbnail with plugin api yet
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
figma.showUI(__html__);
figma.ui.resize(460, 350);
let coverPage;
let coverInstance;
let selection;
figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
    console.log(msg.designers);
    if (msg.type === "finish") {
        // capture selection before creating page, or selection will be negated
        selection = figma.currentPage.selection[0];
        createPage();
        insertCoverComponent(msg);
    }
    else if ((msg.type = "cancel")) {
        figma.closePlugin();
    }
    // figma.closePlugin();
});
function getCover() {
    return __awaiter(this, void 0, void 0, function* () {
        // get cover component by its key
        // obtained from console.logging a selected instance
        const componentKey = "02b9b056225fd1f3e40fd77be519f11198e65cdf";
        const component = yield figma.importComponentByKeyAsync(componentKey);
        return component;
    });
}
function insertCoverComponent(msg) {
    return __awaiter(this, void 0, void 0, function* () {
        let coverComponent = yield getCover();
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
        // replace title in instance with title of file
        yield figma.loadFontAsync({ family: "Inter", style: "Bold" });
        const infoAutoLayout = findNode(coverInstance.children, "info");
        findNode(infoAutoLayout.children, "file_name").characters = figma.root.name;
        // replace title in instance with title of file
        yield figma.loadFontAsync({ family: "Inter", style: "Regular" });
        const team_members = findNode(infoAutoLayout.children, "team_members");
        team_members.characters = `Designer(s):${msg.designers}`;
        // replace image in instance with exported image of selection
        const imageArr = yield selection.exportAsync({ format: "PNG" });
        var hash = figma.createImage(imageArr).hash;
        const mockup = findNode(coverInstance.children, "mockup");
        const preview_img = findNode(mockup.children, "preview_img");
        preview_img.fills = [{ type: "IMAGE", scaleMode: "FILL", imageHash: hash }];
    });
}
function findNode(children, string) {
    for (const node of children) {
        if (node.name === string) {
            return node;
        }
    }
}
function createPage() {
    coverPage = figma.createPage();
    coverPage.name = "Cover";
    figma.currentPage = coverPage;
    // insert new page at the top of the root (first page)
    figma.root.insertChild(0, coverPage);
}
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
