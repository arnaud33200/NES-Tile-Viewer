
var previewTilePixelSize = 0;
var previewTilePixelPadding = 0;

var brushColorIndex = -1;

// ################################################################################

function loadFileBytes(file) {
	if (!file) { return; }

	var reader = new FileReader();
	reader.readAsArrayBuffer(file);

	reader.onload = function (evt) {
		var bytes = new Uint8Array(evt.target.result);
		currentBytes = bytes;
		cleanSelectedPreview();
		refreshTileViewerCanvas();				
	}
	reader.onerror = function (evt) {
		console.log("error reading file");
	}
}

function refreshTileViewerCanvas() {
	document.getElementById("totalTilesBadges").innerHTML = currentBytes.length / (tileWidthPixelCount * layerCount);

	paintAllTilesFromBytesRow(currentBytes);
	updateTilePreviewCanvas();
	// refresh palette
	colorPalette.forEach(function(color, i) {
		document.getElementById('colorPicker' + (i+1)).value = color;	
		document.getElementById('brushColor' + (i+1)).style.backgroundColor = color;	
	});	
}

var selectedByteIndex = -1;
function updateTilePreviewCanvas() {
	var canvas = document.getElementById("previewCanvas");
	var context = canvas.getContext("2d");
	context.clearRect(0, 0, canvas.width, canvas.height);
	if (selectedByteIndex < 0) { return; }

	previewTilePixelPadding = 2;
	previewTilePixelSize = Math.floor((canvas.width - (tileWidthPixelCount * previewTilePixelPadding)) / tileWidthPixelCount);
	paintSingeTile(context, previewTilePixelSize, currentBytes, selectedByteIndex, 0, 0, previewTilePixelPadding);

	document.getElementById("previewTileHex").innerHTML = getTileHexString(currentBytes, selectedByteIndex);

	document.getElementById("tileNumberLabel").innerHTML = "(#" + Math.floor(selectedByteIndex / (tileWidthPixelCount * layerCount) + 1) + ")";
}

function cleanSelectedPreview() {	
	selectedByteIndex = -1;
	var canvas = document.getElementById("previewCanvas");
	var context = canvas.getContext("2d");
	context.clearRect(0, 0, canvas.width, canvas.height);

	document.getElementById("previewTileHex").innerHTML = "";
	document.getElementById("tileNumberLabel").innerHTML = "";
}

function brushColorSelected(index) {
	brushColorIndex = index;
	var checkBoxNumber = index >= 0 ? index + 1 : 5
	document.getElementById('brushColorCheck' + checkBoxNumber).checked = true;
}

function fillAllPixel() {
	for (var y = 0; y < tileWidthPixelCount; y++) {
		for (var x = 0; x < tileWidthPixelCount; x++) {
			changeTilePreviewPixelColor({ x: x, y: y });
		}
	}
	refreshTileViewerCanvas();	
}

function onPreviewCanvasClicked(e) {
	const pixelSize = previewTilePixelSize + previewTilePixelPadding;
	const coordinate = getPixelCoordinateInCanvas(e.layerX, e.layerY, pixelSize);
	changeTilePreviewPixelColor(coordinate);
	refreshTileViewerCanvas();	
}

function changeTilePreviewPixelColor(coordinate) {
	const hexLayout1 = currentBytes[selectedByteIndex + coordinate.y];
	const hexLayout2 = currentBytes[selectedByteIndex + coordinate.y + tileWidthPixelCount];

	var binaryLayout1 = hexToBinary(byteToHexString(hexLayout1));
	var binaryLayout2 = hexToBinary(byteToHexString(hexLayout2));

	var binarySum = parseInt(binaryLayout1.charAt(coordinate.x)) + (2 * parseInt(binaryLayout2.charAt(coordinate.x)));
	if (brushColorIndex < 0) {
		binarySum = (binarySum + 1) % 4;
	} else {
		binarySum = brushColorIndex;
	}

	if (binarySum == 1 || binarySum == 3) {
		binaryLayout1 = binaryLayout1.replaceAt(coordinate.x, "1");
	} else {
		binaryLayout1 = binaryLayout1.replaceAt(coordinate.x, "0");
	}

	if (binarySum == 2 || binarySum == 3) {
		binaryLayout2 = binaryLayout2.replaceAt(coordinate.x, "1");
	} else {
		binaryLayout2 = binaryLayout2.replaceAt(coordinate.x, "0");
	}

	currentBytes[selectedByteIndex + coordinate.y] = binaryToHex(binaryLayout1);
	currentBytes[selectedByteIndex + coordinate.y + tileWidthPixelCount] = binaryToHex(binaryLayout2);	
}

function buildOtherColorPaletteTable(dropdown) {
	otherPalette.forEach(function(palette, i) {
		var dropItem = createElement('a', { 
			className : 'dropdown-item',
			onclick : function() { colorSelected(i) }
		})

		var tr = document.createElement("tr");
		tr.appendChild(createElement("td", { style : "width: 110px" })
			.addChild(createElement('h6', { 
				style : "margin-right: 20px; margin-top: .5rem;",
				innerHTML: palette.title
			})));
		palette.colors.forEach(function(color, i) {
			tr.appendChild(document.createElement("td").addChild(createElement('div', { 
				style : "background: " + color,
				className : "paletteSelector"
			})));
		});

		dropItem.appendChild(document.createElement("table").addChild(tr));
		dropdown.appendChild(dropItem);
	});
}

// ################################################################################
// ### COLOR UPDATE

var lastPickedColorTime = 0;
function onColorClicked(index) {
	const nowTime = new Date().getTime();
	const timeDiff = nowTime - lastPickedColorTime
	if (timeDiff < 500) {
		return;
	}
	const colorValue = document.getElementById("colorPicker" + index).value;
	colorPalette[index-1] = colorValue;
	refreshTileViewerCanvas();
	lastPickedColorTime = nowTime;
}

function colorSelected(index) {
	colorPalette = otherPalette[index].colors;
	refreshTileViewerCanvas();
}

function shiftColor(orientation) {
	var newColors = [];
	for (var i = 0; i < colorPalette.length; i++) {
		var index = (i + orientation) % (colorPalette.length);
		index = index < 0 ? colorPalette.length -1 : index;
		newColors[i] = colorPalette[index];
	}
	colorPalette = newColors;
	refreshTileViewerCanvas();
}

// ################################################################################
// ### SETTINGS UPDATE

function updateTilePerRow(value) {
	document.getElementById("tilePerRowLabel").innerHTML = value;
	tilePerRow = parseInt(value);
	refreshTileViewerCanvas();
}

function updatePixelPerTile(value) {
	document.getElementById("pixelPerTileLabel").innerHTML = value;
	tileWidthPixelCount = parseInt(value);
	refreshTileViewerCanvas();
}

function updateTilePadding(value) {
	document.getElementById("tilePaddingRange").innerHTML = value;
	tilepaddingSize = parseInt(value);
	refreshTileViewerCanvas();
}

function updatePixelPadding(value) {
	document.getElementById("pixelPaddingRange").innerHTML = value;
	pixelpaddingSize = parseInt(value);
	refreshTileViewerCanvas();
}

// ################################################################################
// ### UTILS

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

function createElement(name, attributes) {
	var element = document.createElement(name);
	Object.keys(attributes).forEach(function(key, i) {
		element[key] = attributes[key];
	});
	return element;
}

Element.prototype.addChild = function(child) {
	this.appendChild(child);
	return this;
};

Element.prototype.addAttributes = function(attributes) {
	Object.keys(attributes).forEach(function(key, i) {
		this[key] = attributes[key];
	});
	return this;
};

