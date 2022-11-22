"use strict";


class Config {

    update_params_for_b_key(key_on_left) {
        this.b_key_on_right = key_on_left;

        if (this.b_key_on_right) {
            this.left_text = `[{x:0.5},"¬\\nEsc\\n\\n\\n\\n\\n\`","!\\n1","\\"\\n2","£\\n3","$\\n4","%\\n5","^\\n6"],
[{x:1},"Tab","Q","W","E","R","T"],
[{x:0.25,a:7},"",{a:4},"Caps Lock","A","S","D","F","G"],
[{x:0.75},"Shift","|\\n\\\\","Z","X","C","V"],
[{x:0.5,w:1.25},"Ctrl",{a:7,w:1.25},"",{a:4,w:1.25},"Super",{w:1.25},"Alt",{a:7,w:1.75},""]`;
            this.right_text = `[{x:0.75},"&\\n7","*\\n8","(\\n9",")\\n0","_\\n-","+\\n=","⌫"],
[{x:0.25},"Y","U","I","O","P","{\\n[","}\\n]"],
[{x:0.5},"H","J","K","L",":\\n;","@\\n'","~\\nEnter\\n\\n\\n\\n\\n#"],
["B","N","M","<\\n,",">\\n.","?\\n/","Shift"],
[{x:0.5,a:7,w:1.75},"",{a:4,w:1.25},"Alt",{a:7,w:1.25},"",{w:1.25},"",{a:4,w:1.25},"Ctrl"]`;
            // Offsets between rows along right edge of left piece...
            this.edge_offsets = [-0.5, 0.25, -0.5, 0.5];
        }
        else {
            this.left_text = `[{x:0.5},"¬\\nEsc\\n\\n\\n\\n\\n\`","!\\n1","\\"\\n2","£\\n3","$\\n4","%\\n5","^\\n6"],
[{x:1},"Tab","Q","W","E","R","T"],
[{x:0.25,a:7},"",{a:4},"Caps Lock","A","S","D","F","G"],
[{x:0.75},"Shift","|\\n\\\\","Z","X","C","V","B"],
[{x:0.5,w:1.25},"Ctrl",{a:7,w:1.25},"",{a:4,w:1.25},"Super",{w:1.25},"Alt",{a:7,w:1.75},""]`;
            this.right_text = `[{x:0.75},"&\\n7","*\\n8","(\\n9",")\\n0","_\\n-","+\\n=","⌫"],
[{x:0.25},"Y","U","I","O","P","{\\n[","}\\n]"],
[{x:0.5},"H","J","K","L",":\\n;","@\\n'","~\\nEnter\\n\\n\\n\\n\\n#"],
[{x:1.0},"N","M","<\\n,",">\\n.","?\\n/","Shift"],
[{x:0.5,a:7,w:1.75},"",{a:4,w:1.25},"Alt",{a:7,w:1.25},"",{w:1.25},"",{a:4,w:1.25},"Ctrl"]`;
            this.edge_offsets = [-0.5, 0.25, 0.5, -0.5];
        }
    }

    constructor() {
        this.update_params_for_b_key(true);

        this.u = 19.05;
        this.hole_width = 14;
        // The diameter (mm) that this particular laser cuts out
        this.kerf = 0.105;
        // How much space around the outside of the board - must be > 0
        // this.hole_gap = this.u - this.hole_width;
        this.board_padding = this.hole_gap;
        this.board_top_padding = this.board_padding;

        this.board_key_width = 7.75
        this.board_key_height = 5

        this.corner_radius = 5.05;
        // M2 >= 2.0
        this.screw_size_small = 2.1;
        // spacer >= 3.3
        this.screw_size_big = 3.3;
        this.screw_padding = this.hole_gap;

        // The full screw_padding square width, on hollow layers.
        this.screw_square = this.screw_size_small + 2 * this.screw_padding;

        this.create_extra_layer = true;

        this.board_offset_padding_external = 4;
        this.board_offset_padding_x = -15;
        this.board_offset_padding_y = 4;
    }

    update() {
        this.board_padding = this.hole_gap;
        this.board_top_padding = this.board_padding;
        this.screw_padding = this.hole_gap;
        this.screw_square = this.screw_size_small + 2 * this.screw_padding;
    }

    get hole_gap() {
        return this.u - this.hole_width;
    }

    get kerf2() { return 0.5 * this.kerf; }
    get board_height() {
        return this.board_key_height * this.u - this.hole_gap +
            2 * this.board_padding + this.board_top_padding; // Second is for holes at top
    }
    get board_width() {
        return this.board_key_width * this.u - this.hole_gap + 2 * this.board_padding;
    }
    get board_offset_x() {
        return (this.board_width + this.board_offset_padding_x);
    }
    get board_offset_y() {
        return (this.board_height + this.board_offset_padding_y);
    }

    get left_edge_offsets() {
        return this.edge_offsets;
    }
    get right_edge_offsets() {
        return this.edge_offsets.map(x => -x).reverse();
    }

    get screw_square2() {
        return 0.5 * this.screw_square;
    }
    // The gap between the screw padding and a key hole 0.5u from the edge of the board
    get screw_padding_gap() {
        return (this.board_padding + 0.5 * this.u) - this.screw_square;
    }
}

var c = new Config();

// ponoko needs style on each g element
var styleText = 'style="fill:none;stroke:#000000;stroke-width:0.2"';

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
                       [0, c.board_height],
                       [c.board_width - c.corner_radius - c.hole_gap / 2 - c.board_padding, 0],
                       [c.board_width - c.corner_radius - c.hole_gap / 2 - c.board_padding - c.u * 0.25, c.board_height]];
    }
    else {
        corner_locs = [[(0.625 + 0.25) * c.u + c.kerf2 + 0, 0],
                       [0.625 * c.u + c.kerf2, c.board_height - 0],
                       [c.board_width, 0],
                       [c.board_width, c.board_height]];
    }
    if (connected) {
        // Complete the outer perimeter, and start the inner
        text += "      Z\" />\n";
        text += "    <path d=\"M " + 0.5 * c.board_width + " " + (c.board_padding + c.kerf2) + "\n";
    }
    else {
        text += "      H " + (top_length_left + c.kerf2) + " V " + (c.board_padding + c.kerf2) + "\n";
    }
    if (is_left) {
        // top left screw padding
        text += "      H " + (c.screw_square + c.kerf2) + "\n";
        text += "      V " + c.screw_square2 + " a " + (c.screw_square2 + c.kerf2) + " " + (c.screw_square2 + c.kerf2) + " 0 0 1 -" + (c.screw_square2 + c.kerf2) + " " + (c.screw_square2 + c.kerf2) + " H " + (c.board_padding + c.kerf2) + "\n";
        // bottom left screw padding
        text += "      V " + (c.board_height - c.screw_square - c.kerf2) + "\n";
        text += "      H " + c.screw_square2 + " a " + (c.screw_square2 + c.kerf2) + " " + (c.screw_square2 + c.kerf2) + " 0 0 1 " + (c.screw_square2 + c.kerf2) + " " + (c.screw_square2 + c.kerf2) + " V " + (c.board_height - (c.board_padding + c.kerf2)) + "\n";
    }
    else {
        // do squiggles here...
        text += "      V " + c.board_padding + "\n"; // Unneeded?
        text += "      H " + (corner_locs[0][0] + c.screw_square) + "\n";
        text += "      V " + (c.board_padding + c.board_top_padding) + "\n";
        text += "      H " + (corner_locs[0][0] + c.hole_gap / 2) + "\n";
        // Go up to midway up the key
        text += "      V " + (c.board_padding + c.board_top_padding - c.hole_gap / 2 + 0.5 * c.u) + "\n";
        for (var i = 0; i < 4; i++) {
            var x = c.right_edge_offsets[3 - i];
            // Align y with start of nub bit...
            text += "      v " + (0.5 * c.u - c.hole_gap / 2) + "\n";
            if (x < 0)
                text += "      h " + -x * c.u + "\n";
            var nub_sz = 0.3 * c.u;
            text += "      h " + nub_sz + "\n";
            text += "      v " + c.hole_gap + "\n";
            text += "      h " + -nub_sz + "\n";
            if (x >= 0)
                text += "      h " + -x * c.u + "\n";
            text += "      v " + (0.5 * c.u - c.hole_gap / 2) + "\n";
        }
        // Draw bottom left screwhole
        text += " V " + (c.board_height - c.screw_square) + "\n";
        text += " H " + (corner_locs[1][0] + 0.5 * c.u) + "\n";
        text += " V " + (c.board_height - c.board_padding) + "\n";
    }
    if (!is_left) {
        // bottom right screw padding
        text += "      H " + (c.board_width - (c.screw_square + c.kerf2)) + "\n";
        text += "      V " + (c.board_height - (c.screw_square2)) + " a " + (c.screw_square2 + c.kerf2) + " " + (c.screw_square2 + c.kerf2) + " 0 0 1 " + (c.screw_square2 + c.kerf2) + " -" + (c.screw_square2 + c.kerf2) + " H " + (c.board_width - (c.board_padding + c.kerf2)) + "\n";
        // top right screw
        text += "      V " + (c.board_padding + c.board_top_padding) + "\n";
        text += "      H " + (c.board_width - c.screw_square) + "\n";
        text += "      V " + c.board_padding + "\n";
        // top right screw padding (1u lower, so more tricky)
        // text += `      V ${screw_top_right+c.screw_square+c.kerf2}\n`;
        // text += `      H ${c.board_width-(c.screw_square2)} a ${c.screw_square2+c.kerf2} ${c.screw_square2+c.kerf2} 0 0 1 0 -${c.screw_square+c.kerf} H ${c.board_width-(c.board_padding+c.kerf2)}\n`;
        // text += `      V ${c.board_padding+c.kerf2}\n`;
    }
    else {
        text += "      H " + (corner_locs[3][0] - 0.5 * c.u) + "\n";
        // ALigned with bottom of keys...
        text += "      v " + -c.screw_square2 + "\n";
        text += "      h " + (0.5 * c.u - c.hole_gap / 2) + "\n";
        // Go up to midway up the key
        text += "      V " + (c.board_height - c.board_padding / 2 - 0.5 * c.u) + "\n";
        for (var i = 0; i < 4; i++) {
            var x = c.left_edge_offsets[3 - i];
            // Align y with start of nub bit...
            text += "      v " + (-0.5 * c.u + c.hole_gap / 2) + "\n";
            if (x > 0)
                text += "      h " + -x * c.u + "\n";
            var nub_sz = 0.3 * c.u;
            text += "      h " + -nub_sz + "\n";
            text += "      v " + -c.hole_gap + "\n";
            text += "      h " + nub_sz + "\n";
            if (x <= 0)
                text += "      h " + -x * c.u + "\n";
            text += "      v " + (-0.5 * c.u + c.hole_gap / 2) + "\n";
        }
        // Go up to top of top key, and draw square around top left screw
        text += " V " + (c.board_padding + c.board_top_padding) + "\n";
        text += " H " + (corner_locs[2][0] - c.screw_square);
        text += " V " + c.board_padding + "\n";
    }
    if (!connected) {
        text += "      H " + (c.board_width - top_length_right - c.kerf2) + " V " + -c.kerf2 + "\n";
    }
    text += "      Z\" />\n";
    var radius = 0.5 * (c.screw_size_big) - c.kerf2;
    text += screwHoles(is_left, radius, true);
    return text;
}

function drawHex(x, y, r) {
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
        hole_locs = [[c.screw_square2, c.screw_square2],
                     [c.screw_square2, c.board_height - c.screw_square2],
                     [c.board_width - c.corner_radius - c.hole_gap / 2 - c.board_padding - c.screw_square2, c.screw_square2],
                     [c.board_width - c.corner_radius - c.hole_gap / 2 - c.board_padding - c.u * 0.25 - 0.25 * c.u, c.board_height - c.screw_square2]];
    }
    else {
        hole_locs = [[(0.625 + 0.25) * c.u + c.kerf2 + c.screw_square2, c.screw_square2],
                     [0.625 * c.u + c.kerf2 + 0.25 * c.u, c.board_height - c.screw_square2],
                     [c.board_width - c.screw_square2, c.screw_square2],
                     [c.board_width - c.screw_square2, c.board_height - c.screw_square2]];
    }
    var text = '';
    for (var i = 0; i < 4; i++) {
        if (!is_hex) {
            text += "    <circle cx=\"" + hole_locs[i][0] + "\" cy=\"" + hole_locs[i][1] + "\" r=\"" + radius + "\" />\n";
        }
        else {
            var cx = hole_locs[i][0];
            var cy = hole_locs[i][1];
            text += drawHex(cx, cy, radius);
        }
    }
    return text;
}
function getLineFromOffsets(offsets, is_up) {
    var y_sign = 1;
    if (is_up)
        y_sign = -1;
    var board_outline = "v " + y_sign * (c.kerf2 + c.u + c.hole_gap / 2) + "\n";
    // Going down, gotta add in hole spacing at top
    if (!is_up)
        board_outline += "v " + c.board_top_padding + "\n";
    offsets.forEach(function (o) {
        board_outline += "h " + o * c.u + "\n";
        board_outline += "v " + y_sign * c.u + "\n";
    });
    board_outline += "v " + y_sign * c.hole_gap / 2 + "\n";
    if (is_up)
        board_outline += "v " + -c.board_top_padding + "\n";


    board_outline += "v " + y_sign * c.kerf2 + "\n";
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
        // Find how many keys in top row
        var numKeys = layout[0].length + layout[0][0].x;
        var startX = c.u * numKeys - (c.u - c.hole_width)*0.5;

        // board_outline += "       M " + (c.board_width - c.corner_radius - c.hole_gap / 2 - c.board_padding) + " " + -c.kerf2 + "\n";
        board_outline += "       M " + (startX) + " " + -c.kerf2 + "\n";
        board_outline += getLineFromOffsets(c.left_edge_offsets, false);
    }
    else {
        board_outline += "      M " + (c.board_width - c.corner_radius) + " " + -c.kerf2 + "\n";
        board_outline += "      a " + (c.corner_radius + c.kerf2) + " " + (c.corner_radius + c.kerf2) + " 0 0 1 " + (c.corner_radius + c.kerf2) + " " + (c.corner_radius + c.kerf2) + "\n";
        board_outline += "      V " + (c.board_height - c.corner_radius);
        board_outline += "      a " + (c.corner_radius + c.kerf2) + " " + (c.corner_radius + c.kerf2) + " 0 0 1 -" + (c.corner_radius + c.kerf2) + " " + (c.corner_radius + c.kerf2) + "\n";
    }
    // Bottom / Left side of board
    if (!is_left) {
        board_outline += "H " + (+0.75*c.u + c.kerf2 - (c.u - c.hole_width)*0.5) + "\n";
        board_outline += getLineFromOffsets(c.right_edge_offsets, true);
    }
    else {
        board_outline += "      H " + c.corner_radius;
        board_outline += "      a " + (c.corner_radius + c.kerf2) + " " + (c.corner_radius + c.kerf2) + " 0 0 1 -" + (c.corner_radius + c.kerf2) + " -" + (c.corner_radius + c.kerf2) + "\n";
        board_outline += "      V " + c.corner_radius;
        board_outline += "      a " + (c.corner_radius + c.kerf2) + " " + (c.corner_radius + c.kerf2) + " 0 0 1 " + (c.corner_radius + c.kerf2) + " -" + (c.corner_radius + c.kerf2) + "\n";
    }

    var offset_x = c.board_offset_padding_external + (is_left ? 0 : c.board_offset_x);

    // 1st layer.
    // ponoko needs style on each g element
    var text = '';
    text += "  <g transform=\"translate(" + offset_x + " " + (c.board_offset_padding_external + 0 * c.board_offset_y) + ")\" " + styleText + ">\n";
    text += board_outline;
    text += "      Z\" />\n";
    for (var row = 0; row < layout.length; row++) {
        for (var col = 0; col < layout[row].length; col++) {
            var x = layout[row][col].x + 0.5 * (layout[row][col].w - 1);
            var k_x = c.board_padding + x * c.u + c.kerf2;
            var k_y = c.board_padding + c.board_top_padding + row * c.u + c.kerf2;
            if (keyboardName == 'left')
                k_x -= 0.25 * c.u;
            text += "    <rect width=\"" + (c.hole_width - c.kerf) + "\" height=\"" + (c.hole_width - c.kerf) + "\" x=\"" + k_x + "\" y=\"" + k_y + "\" />\n";
        }
    }
    var radius = 0.5 * (c.screw_size_small) - c.kerf2;
    text += screwHoles(is_left, radius);
    text += '  </g>\n';
    // Layer 2 - micro usb + trrs
    var usb_width2 = 5;
    // >= 2.5
    var trrs_width2 = 2.7;
    // the trrs socket is laid on its side, with the legs pointing towards the micro usb socket
    // half width of trrs + leg length >= 5.3
    var trrs_legs_width2 = 7.0;
    text += "  <g transform=\"translate(" + offset_x + " " + (c.board_offset_padding_external + 1 * c.board_offset_y) + ")\" " + styleText + ">\n";
    var layer2_left;
    var layer2_right;
    if (keyboardName === 'left') {
        layer2_left = c.board_padding - 0.5 * c.hole_gap + 5.5 * c.u - usb_width2 - 0.5 * c.u;
        layer2_right = c.board_padding - 0.5 * c.hole_gap + 1.25 * c.u - trrs_width2 + 0.5 * c.u;
    }
    else {
        layer2_left = c.board_padding - 0.5 * c.hole_gap + 0.75 * c.u - trrs_width2 + c.u;
        layer2_right = c.board_padding - 0.5 * c.hole_gap + 6.0 * c.u - usb_width2 - c.u;
    }
    text += board_outline;
    text += get_layer(layer2_left, layer2_right, is_left);
    text += '  </g>\n';
    // Layer 3
    text += "  <g transform=\"translate(" + offset_x + " " + (c.board_offset_padding_external + 2 * c.board_offset_y) + ")\" " + styleText + ">\n";
    var layer3_left;
    var layer3_right;
    if (keyboardName === 'left') {
        layer3_left = c.board_padding - 0.5 * c.hole_gap + 6.5 * c.u - trrs_legs_width2 - 0.5 * c.u;
        layer3_right = c.board_padding - 0.5 * c.hole_gap + 1.25 * c.u - trrs_width2 + 0.5 * c.u;
    }
    else {
        layer3_left = c.board_padding - 0.5 * c.hole_gap + 0.75 * c.u - trrs_width2 + c.u;
        layer3_right = c.board_padding - 0.5 * c.hole_gap + 7.0 * c.u - trrs_legs_width2 - c.u;
    }
    text += board_outline;
    text += get_layer(layer3_left, layer3_right, is_left);
    text += '  </g>\n';

    if (c.create_extra_layer) {
        // Layer 4? - extra sandwich layer to give room for cherry mx switches
        text += "  <g transform=\"translate(" + offset_x + " " + (c.board_offset_padding_external + 3 * c.board_offset_y) + ")\" " + styleText + ">\n";
        text += board_outline;
        text += get_layer(0, 0, is_left, true);
        text += '  </g>\n';
    }

    // Layer 4/5 (bottom layer)
    var layer_num = c.create_extra_layer ? 5 : 4;
    text += "  <g transform=\"translate(" + offset_x + " " + (c.board_offset_padding_external + (layer_num-1) * c.board_offset_y) + ")\" " + styleText + ">\n";
    text += board_outline;
    text += "      Z\" />\n";
    text += screwHoles(is_left, radius);
    text += '  </g>\n';

    return text;
}

function getFullKbSVG() {
    // showKeyPositions('left', left_text);
    // showKeyPositions('right', right_text);
    var svgAll = '';
    svgAll += '<?xml version="1.0" encoding="UTF-8"?>\n';
    var num_layers = c.create_extra_layer ? 5 : 4;
    // Calculate dimensions of drawing - including external padding
    var w = c.board_offset_x * 2 + 2*c.board_offset_padding_external - c.board_offset_padding_x;
    var h = (c.board_offset_y * num_layers) + (2*c.board_offset_padding_external) - c.board_offset_padding_y;
    svgAll += '<svg xmlns="http:www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '"\n';
    svgAll += "  " + styleText + ">\n";
    svgAll += getSvg('left', c.left_text, 0);
    svgAll += getSvg('right', c.right_text, 1);
    svgAll += '</svg>';

    return svgAll;
}

// function main() {
//     return __awaiter(this, void 0, void 0, function () {
//         var leftText, right_text, svgAll;
//         return __generator(this, function (_a) {
//             switch (_a.label) {
//                 case 0: return [4 /*yield*/, fs_1.promises.readFile('left.txt', 'utf8')];
//                 case 1:
//                     leftText = _a.sent();
//                     return [4 /*yield*/, fs_1.promises.readFile('right.txt', 'utf8')];
//                 case 2:
//                     right_text = _a.sent();
//                     showKeyPositions('left', leftText);
//                     showKeyPositions('right', right_text);
//                     svgAll = '';
//                     svgAll += '<?xml version="1.0" encoding="UTF-8"?>\n';
//                     svgAll += '<svg xmlns="http://www.w3.org/2000/svg" width="790mm" height="384mm" viewBox="0 0 790 384"\n';
//                     svgAll += "  " + styleText + ">\n";
//                     svgAll += getSvg('left', leftText, 0);
//                     svgAll += getSvg('right', right_text, 1);
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
