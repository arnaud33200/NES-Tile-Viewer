function loadFileBytes(file) {
	if (!file) { return; }
	
	var reader = new FileReader();
	reader.readAsArrayBuffer(file);

	reader.onload = function (evt) {
		var bytes = new Uint8Array(evt.target.result);
		currentBytes = bytes;
		selectedByteIndex = -1;
		refreshTileViewerCanvas();				
	}
	reader.onerror = function (evt) {
		console.log("error reading file");
	}
}

function refreshTileViewerCanvas() {
	paintAllTilesFromBytesRow(currentBytes);
	updateTilePreviewCanvas();
	// refresh palette
	colorPalette.forEach(function(color, i) {
		document.getElementById('colorPicker' + (i+1)).value = color;	
	});	
}

var selectedByteIndex = -1;
function updateTilePreviewCanvas() {
	var canvas = document.getElementById("previewCanvas");
	var context = canvas.getContext("2d");
	context.clearRect(0, 0, canvas.width, canvas.height);
	if (selectedByteIndex < 0) { return; }

	const pixelPadding = 2;
	const size = Math.floor((canvas.width - (tileWidthPixelCount * pixelPadding)) / tileWidthPixelCount);
	paintSingeTile(context, size, currentBytes, selectedByteIndex, 0, 0, pixelPadding);
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

