
var colorPalette = ["#000000", "#c9b447", "#6f91ca", "#b52875"];

const otherPalette = [
{ title: "Default", colors: ["#000000", "#c9b447", "#6f91ca", "#b52875"]},
{ title: "Classic", colors: ["#141414", "#ff9b3b", "#8c7300", "#da2a00"]},
{ title: "Grey", colors: ["#000000", "#cbcbcb", "#929292", "#4a4a4a"]},
{ title: "Game Boy", colors: ["#0f380f", "#9bbc0f", "#8bac0f", "#306230"]},
{ title: "Fire", colors: ["#810000", "#eee500", "#b67000", "#d33600"]},
{ title: "Darkness", colors: ["#ffffff", "#3b0087", "#8f47b2", "#c17bc7"]},
{ title: "Rainbow", colors: ["#2933b6", "#e9eb3e", "#00c94e", "#d4006a"]}
];

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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

function paintTileFromBytesRow(bytes) {
	var canvas = document.getElementById("myCanvas");
	var context = canvas.getContext("2d");
	context.clearRect(0, 0, canvas.width, canvas.height);

	const tilepaddingSize = 2;
	const pixelpaddingSize = 0;

	const rowPixelCount = 8;	
	const tilePerRow = 16;
	
	// const pixelSize = 10;
	const pixelSize = Math.round((canvas.width - (tilePerRow * tilepaddingSize) - (tilePerRow * rowPixelCount * pixelpaddingSize)) / tilePerRow / rowPixelCount, 0);
	
	const tileSize = rowPixelCount * pixelSize;

	const layerCount = 2;
	const hexPerTile = rowPixelCount * layerCount;

	const maxVerticalCount = getTileXyIndex(bytes.length, hexPerTile, tilePerRow).y + 1;
	canvas.height = (maxVerticalCount * rowPixelCount * (pixelSize + pixelpaddingSize)) + (maxVerticalCount * tilepaddingSize);

	for (var tileIndex = 0; tileIndex < bytes.length; tileIndex += hexPerTile) {

		const tileXyIndex = getTileXyIndex(tileIndex, hexPerTile, tilePerRow);

		const offetX = tileXyIndex.x * (tileSize + tilepaddingSize) + (tileXyIndex.x * rowPixelCount * pixelpaddingSize);
		const offetY = tileXyIndex.y * (tileSize + tilepaddingSize) + (tileXyIndex.y * rowPixelCount * pixelpaddingSize);

		for (var y = tileIndex; y < tileIndex + rowPixelCount; y++) {

			const binary1 = dataToBinary(bytes, y);
			const binary2 = dataToBinary(bytes, y+rowPixelCount);

			for (var x = 0; x < binary1.length; x++) {
				const colorIndex = parseInt(binary1.charAt(x)) + (2*parseInt(binary2.charAt(x)));
				context.fillStyle = colorPalette[colorIndex];

				const posX = (x * pixelSize) + offetX + (x * pixelpaddingSize);
				const posY = ((y % rowPixelCount) * pixelSize) + offetY + ((y %rowPixelCount) * pixelpaddingSize);
				context.fillRect(posX, posY, pixelSize, pixelSize);
			}
		}
	}
}