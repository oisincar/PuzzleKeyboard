"use strict";

var u = 19.05;
var hole_width = 14;
var hole_gap = u - hole_width;
// How much space around the outside of the board - must be > 0
var board_padding = hole_gap;
// The diameter (mm) that this particular laser cuts out
var kerf = 0.105;
var kerf2 = 0.5 * kerf;
var board_width = 7.75 * u - hole_gap + 2 * board_padding;
var board_top_padding = board_padding;
var board_height = 5 * u - hole_gap + 2 * board_padding + board_top_padding; // Second is for holes at top
var corner_radius = 5.05;
var board_offset_padding = 0.75 * board_padding + kerf;
var board_offset_x = 1 * (board_width + board_offset_padding);
var board_offset_y = 1 * (board_height + board_offset_padding);
// M2 >= 2.0
var screw_size_small = 2.1;
// spacer >= 3.3
// const screw_size_big = 3.4;
var screw_size_big = 2.1;
var screw_padding = hole_gap;
// The full screw_padding square width
var screw_square = screw_size_big + 2 * screw_padding;
var screw_square2 = 0.5 * screw_square;
// The gap between the screw padding and a key hole 0.5u from the edge of the board
var screw_padding_gap = (board_padding + 0.5 * u) - screw_square;
// // How far down screw padding in top right is
var screw_top_right = 0;
// ponoko needs style on each g element
var styleText = 'style="fill:none;stroke:#000000;stroke-width:0.2"';

// Offsets between rows along right edge of left piece...
var left_edge_dumbo = [-0.5, 0.25, -0.5, 0.5];
// Vice versa
var right_edge_dumbo = [0.5, -0.25, 0.5, -0.5].reverse();

var create_extra_layer = true;


function parseKeyboardLayoutField(text) {
    if (text.length === 0) {
        return 'error';
    }
    if (text.charAt(0) === '{') {
        var res = { x: -1, w: -1 };
        var endPos = text.indexOf('}');
        if (endPos === -1) {
            return 'error';
        }
        var pairs = text.slice(1, endPos).split(',');
        for (var _i = 0, pairs_1 = pairs; _i < pairs_1.length; _i++) {
            var pairText = pairs_1[_i];
            var pair = pairText.split(':');
            if (pair[0] === 'x') {
                res.x = parseFloat(pair[1]);
            }
            if (pair[0] === 'w') {
                res.w = parseFloat(pair[1]);
            }
        }
        return [res, text.slice(endPos + 1)];
    }
    else if (text.charAt(0) === '"') {
        var pos = 1;
        while (pos < text.length && text.charAt(pos) !== '"') {
            if (text.charAt(pos) === '\\') {
                pos++;
            }
            pos++;
        }
        if (pos >= text.length) {
            return 'error';
        }
        return ['key', text.slice(pos + 1)];
    }
    else {
        return 'error';
    }
}
function parseKeyboardLayoutLine(text) {
    var x = 0;
    var lastFieldData;
    var res = [];
    while (text.length > 0 && text.charAt(0) !== ']') {
        if (text.charAt(0) === ',') {
            text = text.slice(1);
        }
        var field = void 0;
        var pair = parseKeyboardLayoutField(text);
        if (pair === 'error') {
            return 'error';
        }
        field = pair[0], text = pair[1];
        if (field === 'key') {
            var fieldData = { x: x, w: 1 };
            if (lastFieldData !== undefined && lastFieldData.x !== -1) {
                x = lastFieldData.x;
                fieldData.x = x;
            }
            if (lastFieldData !== undefined && lastFieldData.w !== -1) {
                fieldData.w = lastFieldData.w;
            }
            res.push(fieldData);
            lastFieldData = undefined;
            x += fieldData.w;
        }
        else {
            lastFieldData = field;
        }
    }
    return [res, text];
}
function parseKeyboardLayout(text) {
    var res = [];
    while (text.length > 0) {
        if (text.charAt(0) !== '[') {
            return 'error';
        }
        var pair = parseKeyboardLayoutLine(text.slice(1));
        if (pair === 'error') {
            return 'error';
        }
        var values = void 0;
        values = pair[0], text = pair[1];
        res.push(values);
        while (text.length > 0 && (text.charAt(0) !== '[')) {
            text = text.slice(1);
        }
    }
    return res;
}
function showKeyPositions(keyboardName, layoutText) {
    console.log(keyboardName);
    var layout = parseKeyboardLayout(layoutText);
    if (layout === 'error') {
        console.log('error');
        return;
    }
    for (var row = 0; row < layout.length; row++) {
        var rowText = '    ';
        for (var col = 0; col < layout[row].length; col++) {
            var x = layout[row][col].x + 0.5 * (layout[row][col].w - 1);
            rowText += "[" + x + "," + row + "],";
        }
        console.log(rowText);
    }
    console.log('');
}
// Get part of the svg text for a sandwich layer, assuming the board outline came beforehand.
// This includes gaps at the top for micro usb and trrs (unless connected === true), and screw holes.
// Starting in the top left, after the curved corner.
function get_layer(top_length_left, top_length_right, is_left, connected) {
    if (connected === void 0) { connected = false; }
    var text = '';
    var corner_locs;
    if (is_left) {
        corner_locs = [[0, 0],
            [0, board_height],
            [board_width - corner_radius - hole_gap / 2 - board_padding, 0],
            [board_width - corner_radius - hole_gap / 2 - board_padding - u * 0.25, board_height]];
    }
    else {
        corner_locs = [[(0.625 + 0.25) * u + kerf2 + 0, 0],
            [0.625 * u + kerf2, board_height - 0],
            [board_width, 0],
            [board_width, board_height]];
    }
    if (connected) {
        // Complete the outer perimeter, and start the inner
        text += "      Z\" />\n";
        text += "    <path d=\"M " + 0.5 * board_width + " " + (board_padding + kerf2) + "\n";
    }
    else {
        text += "      H " + (top_length_left + kerf2) + " V " + (board_padding + kerf2) + "\n";
    }
    if (is_left) {
        // top left screw padding
        text += "      H " + (screw_square + kerf2) + "\n";
        text += "      V " + screw_square2 + " a " + (screw_square2 + kerf2) + " " + (screw_square2 + kerf2) + " 0 0 1 -" + (screw_square2 + kerf2) + " " + (screw_square2 + kerf2) + " H " + (board_padding + kerf2) + "\n";
        // bottom left screw padding
        text += "      V " + (board_height - screw_square - kerf2) + "\n";
        text += "      H " + screw_square2 + " a " + (screw_square2 + kerf2) + " " + (screw_square2 + kerf2) + " 0 0 1 " + (screw_square2 + kerf2) + " " + (screw_square2 + kerf2) + " V " + (board_height - (board_padding + kerf2)) + "\n";
    }
    else {
        // do squiggles here...
        text += "      V " + board_padding + "\n"; // Unneeded?
        text += "      H " + (corner_locs[0][0] + screw_square) + "\n";
        text += "      V " + (board_padding + board_top_padding) + "\n";
        text += "      H " + (corner_locs[0][0] + hole_gap / 2) + "\n";
        // Go up to midway up the key
        text += "      V " + (board_padding + board_top_padding - hole_gap / 2 + 0.5 * u) + "\n";
        for (var i = 0; i < 4; i++) {
            var x = right_edge_dumbo[3 - i];
            // Align y with start of nub bit...
            text += "      v " + (0.5 * u - hole_gap / 2) + "\n";
            if (x < 0)
                text += "      h " + -x * u + "\n";
            var nub_sz = 0.3 * u;
            text += "      h " + nub_sz + "\n";
            text += "      v " + hole_gap + "\n";
            text += "      h " + -nub_sz + "\n";
            if (x >= 0)
                text += "      h " + -x * u + "\n";
            text += "      v " + (0.5 * u - hole_gap / 2) + "\n";
        }
        // Draw bottom left screwhole
        text += " V " + (board_height - screw_square) + "\n";
        text += " H " + (corner_locs[1][0] + 0.5 * u) + "\n";
        text += " V " + (board_height - board_padding) + "\n";
    }
    if (!is_left) {
        // bottom right screw padding
        text += "      H " + (board_width - (screw_square + kerf2)) + "\n";
        text += "      V " + (board_height - (screw_square2)) + " a " + (screw_square2 + kerf2) + " " + (screw_square2 + kerf2) + " 0 0 1 " + (screw_square2 + kerf2) + " -" + (screw_square2 + kerf2) + " H " + (board_width - (board_padding + kerf2)) + "\n";
        // top right screw
        text += "      V " + (board_padding + board_top_padding) + "\n";
        text += "      H " + (board_width - screw_square) + "\n";
        text += "      V " + board_padding + "\n";
        // top right screw padding (1u lower, so more tricky)
        // text += `      V ${screw_top_right+screw_square+kerf2}\n`;
        // text += `      H ${board_width-(screw_square2)} a ${screw_square2+kerf2} ${screw_square2+kerf2} 0 0 1 0 -${screw_square+kerf} H ${board_width-(board_padding+kerf2)}\n`;
        // text += `      V ${board_padding+kerf2}\n`;
    }
    else {
        text += "      H " + (corner_locs[3][0] - 0.5 * u) + "\n";
        // ALigned with bottom of keys...
        text += "      v " + -screw_square2 + "\n";
        text += "      h " + (0.5 * u - hole_gap / 2) + "\n";
        // Go up to midway up the key
        text += "      V " + (board_height - board_padding / 2 - 0.5 * u) + "\n";
        for (var i = 0; i < 4; i++) {
            var x = left_edge_dumbo[3 - i];
            // Align y with start of nub bit...
            text += "      v " + (-0.5 * u + hole_gap / 2) + "\n";
            if (x > 0)
                text += "      h " + -x * u + "\n";
            var nub_sz = 0.3 * u;
            text += "      h " + -nub_sz + "\n";
            text += "      v " + -hole_gap + "\n";
            text += "      h " + nub_sz + "\n";
            if (x <= 0)
                text += "      h " + -x * u + "\n";
            text += "      v " + (-0.5 * u + hole_gap / 2) + "\n";
        }
        // Go up to top of top key, and draw square around top left screw
        text += " V " + (board_padding + board_top_padding) + "\n";
        text += " H " + (corner_locs[2][0] - screw_square);
        text += " V " + board_padding + "\n";
    }
    if (!connected) {
        text += "      H " + (board_width - top_length_right - kerf2) + " V " + -kerf2 + "\n";
    }
    text += "      Z\" />\n";
    var radius = 0.5 * (screw_size_big) - kerf2;
    text += screwHoles(is_left, radius, true);
    // text += `    <circle cx="${screw_square2}" cy="${screw_square2}" r="${radius}" />\n`;
    // text += `    <circle cx="${screw_square2}" cy="${board_height-screw_square2}" r="${radius}" />\n`;
    // text += `    <circle cx="${board_width-screw_square2}" cy="${board_height-screw_square2}" r="${radius}" />\n`;
    // text += `    <circle cx="${board_width-screw_square2}" cy="${screw_top_right+screw_square2}" r="${radius}" />\n`;
    return text;
}
function drawHex(x, y) {
    var r = 3.3 * 0.5;
    var a = 0;
    var text = '';
    text += "<path d=\"M " + (x + r * Math.cos(a)) + " " + (y + r * Math.sin(a)) + "\n";
    for (var i = 0; i < 5; i++) {
        a += Math.PI / 3;
        text += "L " + (x + r * Math.cos(a)) + " " + (y + r * Math.sin(a)) + "\n";
    }
    text += "Z\" />\n";
    return text;
}
function screwHoles(is_left, radius, is_hex) {
    if (is_hex === void 0) { is_hex = false; }
    // Hole cols
    var hole_locs;
    if (is_left) {
        hole_locs = [[screw_square2, screw_square2],
            [screw_square2, board_height - screw_square2],
            [board_width - corner_radius - hole_gap / 2 - board_padding - screw_square2, screw_square2],
            [board_width - corner_radius - hole_gap / 2 - board_padding - u * 0.25 - 0.25 * u, board_height - screw_square2]];
    }
    else {
        hole_locs = [[(0.625 + 0.25) * u + kerf2 + screw_square2, screw_square2],
            [0.625 * u + kerf2 + 0.25 * u, board_height - screw_square2],
            [board_width - screw_square2, screw_square2],
            [board_width - screw_square2, board_height - screw_square2]];
    }
    var text = '';
    for (var i = 0; i < 4; i++) {
        if (!is_hex) {
            text += "    <circle cx=\"" + hole_locs[i][0] + "\" cy=\"" + hole_locs[i][1] + "\" r=\"" + radius + "\" />\n";
        }
        else {
            var cx = hole_locs[i][0];
            var cy = hole_locs[i][1];
            text += drawHex(cx, cy);
        }
    }
    return text;
}
function getLineFromOffsets(offsets, is_up) {
    var y_sign = 1;
    if (is_up)
        y_sign = -1;
    var board_outline = "v " + y_sign * (u + hole_gap / 2) + "\n";
    // Going down, gotta add in hole spacing at top
    if (!is_up)
        board_outline += "v " + board_top_padding + "\n";
    offsets.forEach(function (o) {
        board_outline += "h " + o * u + "\n";
        board_outline += "v " + y_sign * u + "\n";
    });
    board_outline += "v " + y_sign * hole_gap / 2 + "\n";
    if (is_up)
        board_outline += "v " + -board_top_padding + "\n";
    return board_outline;
}
function getSvg(keyboardName, layoutText, svgPos) {
    var layout = parseKeyboardLayout(layoutText);
    if (layout === 'error') {
        console.log(keyboardName, 'error');
        return;
    }
    var is_left = keyboardName == 'left';
    // The outline of the board, aprt from the top, starting with the top right curve
    // Add kerf on all sides, so that key positions don't need to change
    var board_outline = '';
    board_outline += "    <path d=\"\n";
    // Top corner/ right side of board
    if (is_left) {
        board_outline += "       M " + (board_width - corner_radius - hole_gap / 2 - board_padding) + " " + -kerf2 + "\n";
        board_outline += getLineFromOffsets(left_edge_dumbo, false);
    }
    else {
        board_outline += "      M " + (board_width - corner_radius) + " " + -kerf2 + "\n";
        board_outline += "      a " + (corner_radius + kerf2) + " " + (corner_radius + kerf2) + " 0 0 1 " + (corner_radius + kerf2) + " " + (corner_radius + kerf2) + "\n";
        board_outline += "      V " + (board_height - corner_radius);
        board_outline += "      a " + (corner_radius + kerf2) + " " + (corner_radius + kerf2) + " 0 0 1 -" + (corner_radius + kerf2) + " " + (corner_radius + kerf2) + "\n";
    }
    // Bottom / Left side of board
    if (!is_left) {
        board_outline += "H " + (corner_radius + 0.375 * u) + "\n";
        board_outline += getLineFromOffsets(right_edge_dumbo, true);
    }
    else {
        board_outline += "      H " + corner_radius;
        board_outline += "      a " + (corner_radius + kerf2) + " " + (corner_radius + kerf2) + " 0 0 1 -" + (corner_radius + kerf2) + " -" + (corner_radius + kerf2) + "\n";
        board_outline += "      V " + corner_radius;
        board_outline += "      a " + (corner_radius + kerf2) + " " + (corner_radius + kerf2) + " 0 0 1 " + (corner_radius + kerf2) + " -" + (corner_radius + kerf2) + "\n";
    }
    // 1st layer.
    // ponoko needs style on each g element
    var text = '';
    text += "  <g transform=\"translate(" + (board_offset_padding + 0 * board_offset_x) + " " + (board_offset_padding + svgPos * board_offset_y) + ")\" " + styleText + ">\n";
    text += board_outline;
    text += "      Z\" />\n";
    for (var row = 0; row < layout.length; row++) {
        for (var col = 0; col < layout[row].length; col++) {
            var x = layout[row][col].x + 0.5 * (layout[row][col].w - 1);
            var k_x = board_padding + x * u + kerf2;
            var k_y = board_padding + board_top_padding + row * u + kerf2;
            if (keyboardName == 'left')
                k_x -= 0.25 * u;
            text += "    <rect width=\"" + (hole_width - kerf) + "\" height=\"" + (hole_width - kerf) + "\" x=\"" + k_x + "\" y=\"" + k_y + "\" />\n";
        }
    }
    var radius = 0.5 * (screw_size_small) - kerf2;
    text += screwHoles(is_left, radius);
    text += '  </g>\n';
    // Layer 2 - micro usb + trrs
    var usb_width2 = 5;
    // >= 2.5
    var trrs_width2 = 2.7;
    // the trrs socket is laid on its side, with the legs pointing towards the micro usb socket
    // half width of trrs + leg length >= 5.3
    var trrs_legs_width2 = 7.0;
    text += "  <g transform=\"translate(" + (board_offset_padding + 1 * board_offset_x) + " " + (board_offset_padding + svgPos * board_offset_y) + ")\" " + styleText + ">\n";
    var layer2_left;
    var layer2_right;
    if (keyboardName === 'left') {
        layer2_left = board_padding - 0.5 * hole_gap + 5.5 * u - usb_width2 - 0.5 * u;
        layer2_right = board_padding - 0.5 * hole_gap + 1.25 * u - trrs_width2 + 0.5 * u;
    }
    else {
        layer2_left = board_padding - 0.5 * hole_gap + 0.75 * u - trrs_width2 + u;
        layer2_right = board_padding - 0.5 * hole_gap + 6.0 * u - usb_width2 - u;
    }
    text += board_outline;
    text += get_layer(layer2_left, layer2_right, is_left);
    text += '  </g>\n';
    // Layer 3
    text += "  <g transform=\"translate(" + (board_offset_padding + 2 * board_offset_x) + " " + (board_offset_padding + svgPos * board_offset_y) + ")\" " + styleText + ">\n";
    var layer3_left;
    var layer3_right;
    if (keyboardName === 'left') {
        layer3_left = board_padding - 0.5 * hole_gap + 6.5 * u - trrs_legs_width2 - 0.5 * u;
        layer3_right = board_padding - 0.5 * hole_gap + 1.25 * u - trrs_width2 + 0.5 * u;
    }
    else {
        layer3_left = board_padding - 0.5 * hole_gap + 0.75 * u - trrs_width2 + u;
        layer3_right = board_padding - 0.5 * hole_gap + 7.0 * u - trrs_legs_width2 - u;
    }
    text += board_outline;
    text += get_layer(layer3_left, layer3_right, is_left);
    text += '  </g>\n';

    if (create_extra_layer) {
        // Layer 4? - extra sandwich layer to give room for cherry mx switches
        text += "  <g transform=\"translate(" + (board_offset_padding + 3 * board_offset_x) + " " + (board_offset_padding + svgPos * board_offset_y) + ")\" " + styleText + ">\n";
        text += board_outline;
        text += get_layer(0, 0, is_left, true);
        text += '  </g>\n';
    }

    // Layer 4/5 (bottom layer)
    var layerNum = create_extra_layer ? 5 : 4;
    text += "  <g transform=\"translate(" + (board_offset_padding + (layerNum-1) * board_offset_x) + " " + (board_offset_padding + svgPos * board_offset_y) + ")\" " + styleText + ">\n";
    text += board_outline;
    text += "      Z\" />\n";
    text += screwHoles(is_left, radius);
    text += '  </g>\n';

    return text;
}

function getFullKbSVG(leftText, rightText) {
    // showKeyPositions('left', leftText);
    // showKeyPositions('right', rightText);
    var svgAll = '';
    svgAll += '<?xml version="1.0" encoding="UTF-8"?>\n';
    // svgAll += '<svg xmlns="http:www.w3.org/2000/svg" width="790mm" height="384mm" viewBox="0 0 790 384"\n';
    var numLayers = create_extra_layer ? 5 : 4;
    var w = board_offset_x * numLayers;
    var h = board_offset_y * 2;
    svgAll += '<svg xmlns="http:www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '"\n';
    svgAll += "  " + styleText + ">\n";
    svgAll += getSvg('left', leftText, 0);
    svgAll += getSvg('right', rightText, 1);
    svgAll += '</svg>\n';

    return svgAll;
}

function test() {
  console.log("HELLO");
}

// function main() {
//     return __awaiter(this, void 0, void 0, function () {
//         var leftText, rightText, svgAll;
//         return __generator(this, function (_a) {
//             switch (_a.label) {
//                 case 0: return [4 /*yield*/, fs_1.promises.readFile('left.txt', 'utf8')];
//                 case 1:
//                     leftText = _a.sent();
//                     return [4 /*yield*/, fs_1.promises.readFile('right.txt', 'utf8')];
//                 case 2:
//                     rightText = _a.sent();
//                     showKeyPositions('left', leftText);
//                     showKeyPositions('right', rightText);
//                     svgAll = '';
//                     svgAll += '<?xml version="1.0" encoding="UTF-8"?>\n';
//                     svgAll += '<svg xmlns="http://www.w3.org/2000/svg" width="790mm" height="384mm" viewBox="0 0 790 384"\n';
//                     svgAll += "  " + styleText + ">\n";
//                     svgAll += getSvg('left', leftText, 0);
//                     svgAll += getSvg('right', rightText, 1);
//                     svgAll += '</svg>\n';
//                     return [4 /*yield*/, fs_1.promises.writeFile('out.svg', svgAll, 'utf8')];
//                 case 3:
//                     _a.sent();
//                     return [2 /*return*/];
//             }
//         });
//     });
// }
// main();
