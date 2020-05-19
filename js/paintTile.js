
var colorPalette = ["#000000", "#c9b447", "#6f91ca", "#b52875"];

const otherPalette = [
{ title: "Default", colors: ["#000000", "#c9b447", "#6f91ca", "#b52875"]},
{ title: "Classic", colors: ["#141414", "#da2a00", "#ff9b3b", "#8c7300"]},
{ title: "Grey", colors: ["#000000", "#cbcbcb", "#929292", "#4a4a4a"]},
{ title: "Game Boy", colors: ["#0f380f", "#9bbc0f", "#8bac0f", "#306230"]},
{ title: "Fire", colors: ["#810000", "#eee500", "#b67000", "#d33600"]},
{ title: "Darkness", colors: ["#ffffff", "#3b0087", "#8f47b2", "#c17bc7"]},
{ title: "Rainbow", colors: ["#2933b6", "#e9eb3e", "#00c94e", "#d4006a"]}
];

// ~~~~~~~~~~~~~~~~~~~~~~~~~

var tilePerRow = 16;
var tileWidthPixelCount = 8;	

var tilepaddingSize = 2;
var pixelpaddingSize = 0;	

const layerCount = 2;
const hexPerTile = tileWidthPixelCount * layerCount;	

// ~~~~~~~~~~~~~~~~~~~~~~~~~

var currentBytes = null;

// ################################################################################

function dataToHexString(bytes, offset) {
	var bytedata = "";
	var size = 1;

	for (var i = 0; i < size; i++) {
		var c = (bytes[offset+i]).toString(16);
		bytedata += c.length == 1 ? "0"+c : c;
	}

	var outputText = "";
	for (var i=0; i<size; i++) {
		var x = bytedata.substring( i*2 , i*2+2 );
		outputText += x + ((i<size-1) ? " " : "" );
	}		
	return outputText;
}

function hexToBinary(hex) {
	return ("00000000" + (parseInt(hex, 16)).toString(2)).substr(-8);
}

function dataToBinary(bytes, offset) {
	return hexToBinary(dataToHexString(bytes, offset));
}

function getTileXyIndex(tileIndex, hexPerTile, tilePerRow) {
	return {
		x: Math.floor(tileIndex / hexPerTile) % tilePerRow,
		y: Math.floor(tileIndex / (hexPerTile * tilePerRow))
	}
}

function getTileBytesIndexFromCoordinate(x, y) {
	const pixelSize = getTilePixelSize();
	const tileSize = (tileWidthPixelCount * pixelSize) + tilepaddingSize + (tileWidthPixelCount * pixelpaddingSize);
	const indexX = Math.floor(x / tileSize);
	const tileIndex = (indexX >= tilePerRow ? tilePerRow - 1 : indexX)
	+ (Math.floor(y / tileSize) * tilePerRow);

	return tileIndex * hexPerTile;
}

function getTilePixelSize() {
	var canvas = document.getElementById("myCanvas");
	const totalPixelRow = tilePerRow * tileWidthPixelCount;
	const allTilesPadding = (tilePerRow * tilepaddingSize);
	const tilePixelsPadding = tilePerRow * tileWidthPixelCount * pixelpaddingSize;
	return Math.floor((canvas.width - allTilesPadding - tilePixelsPadding) / totalPixelRow);
}

function paintAllTilesFromBytesRow(bytes) {
	var canvas = document.getElementById("myCanvas");
	var context = canvas.getContext("2d");
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	// const pixelSize = 10;
	const pixelSize = getTilePixelSize();
	
	const tileSize = tileWidthPixelCount * pixelSize;

	const maxVerticalCount = getTileXyIndex(bytes.length, hexPerTile, tilePerRow).y + 1;
	canvas.height = (maxVerticalCount * tileWidthPixelCount * (pixelSize + pixelpaddingSize)) + (maxVerticalCount * tilepaddingSize);

	for (var byteIndex = 0; byteIndex < bytes.length; byteIndex += hexPerTile) {

		const tileXyIndex = getTileXyIndex(byteIndex, hexPerTile, tilePerRow);

		const offetX = tileXyIndex.x * (tileSize + tilepaddingSize) + (tileXyIndex.x * tileWidthPixelCount * pixelpaddingSize);
		const offetY = tileXyIndex.y * (tileSize + tilepaddingSize) + (tileXyIndex.y * tileWidthPixelCount * pixelpaddingSize);

		paintSingeTile(context, pixelSize, bytes, byteIndex, offetX, offetY, pixelpaddingSize);
	}
}

function paintSingeTile(context, pixelSize, bytes, byteIndex, offetX, offetY, pixelpaddingSize) {
	for (var y = byteIndex; y < byteIndex + tileWidthPixelCount; y++) {
		const binary1 = dataToBinary(bytes, y);
		const binary2 = dataToBinary(bytes, y+tileWidthPixelCount);

		for (var x = 0; x < binary1.length; x++) {
			const colorIndex = parseInt(binary1.charAt(x)) + (2*parseInt(binary2.charAt(x)));
			context.fillStyle = colorPalette[colorIndex];

			const posX = (x * pixelSize) + offetX + (x * pixelpaddingSize);
			const posY = ((y % tileWidthPixelCount) * pixelSize) + offetY + ((y %tileWidthPixelCount) * pixelpaddingSize);
			context.fillRect(posX, posY, pixelSize, pixelSize);
		}
	}
}

function getTileHexString(bytes, byteIndex) {
	var tileHexString = "";
	for (var y = byteIndex; y < byteIndex + (tileWidthPixelCount * layerCount); y++) {
		const space = (y - byteIndex) % 2 == 0 ? " " : "";
		const hexString = dataToHexString(bytes, y);
		tileHexString += (tileHexString.length == 0 ? "" : space) + hexString;
	}
	return tileHexString;
}
