# How To Use?
Initialize the parser:<br />
<b>TMX_Parser.init(canvas, draw_mode, debug);</b><br />
<b>@param</b> canvas: Reference of canvas element. <b>[HTML Object]</b><br />
<b>@param</b> draw_mode: Mode of Parser. (1: <b>Orthogonal</b>, 2: <b>Isometric</b>) <b>[number]</b><br />
<b>@param</b> debug: are debug messages will be shown? <b>[true/false]</b> - default: <b>false</b><br /><br />
--------------------------------------------------------------------<br /><br />
Load the TMX file:<br />
<b>TMX_Parser.load(pathOfFile,autoRun);</b><br />
<b>@param</b> pathOfFile: Your file's path that will be parsed. <b>[string]</b><br />
<b>@param</b> autoRun: Start parsing process automatically. <b>[true/false]</b> - default: <b>false</b><br /><br />
--------------------------------------------------------------------<br /><br />
<b>TMX_Parser.run();</b> # Run parsing process manually. <b>[void]</b><br /><br />
--------------------------------------------------------------------<br /><br />
Draw the map:<br />
<b>TMX_Parser.draw(offsetX, offsetY);</b> # After layers rendered, run for drawing to canvas. (Function will be not fired automatically at currently. You must call it manually unless you don't handle the "<b>TMX_Parser_tileset_loaded</b>" event.) <b>[void]</b><br />
<b>@param</b> offsetX: Offset from X. <b>[number]</b><br />
<b>@param</b> offsetY: Offset from Y. <b>[number]</b><br /><br />
--------------------------------------------------------------------<br /><br />
<b>Note:</b> Every loaded file will be storing in the variable. If you want to switch to specific file and run functions on it, use function in the below:<br/>
<b>TMX_Parser.watcher.switchFile(filePureName);</b> # Switch to specific file that already loaded. <b>[void]</b><br/>
<b>@param</b> filePureName: Your file's name without extension. (e.g.: map, test, example_map) <b>[string]</b><br />
<b>@return: </b> <b>true</b> if successfully switched, <b>false</b> on error.<br/><br />
--------------------------------------------------------------------<br /><br />
Convert Isometric coordinates to Page coordinates:<br />
<b>TMX_Parser.IsoToCoords(x, y, tileWidthHalf, tileHeightHalf);</b> <b>[object]</b><br />
<b>@param</b> x: Map matrix X position. <b>[number]</b><br />
<b>@param</b> y: Map matrix Y position. <b>[number]</b><br />
<b>@param</b> tileWidthHalf: Half of tile width. <b>[number]</b><br />
<b>@param</b> tileHeightHalf: Half of tile height. <b>[number]</b><br /><br />
--------------------------------------------------------------------<br /><br />
Convert Page coordinates to Isometric coordinates:<br />
<b>TMX_Parser.IsoToCoords(x, y, tileWidthHalf, tileHeightHalf);</b> <b>[object]</b><br />
<b>@param</b> map_name: Pure name of TMX file <b>[string]</b><br />
<b>@param</b> pageX: X position of mouse cursor at page. <b>[number]</b><br />
<b>@param</b> pageY: Y position of mouse cursor at page. <b>[number]</b><br />
<b>@param</b> offsetX: Offset from X. <b>[number]</b><br />
<b>@param</b> offsetY: Offset from Y. <b>[number]</b><br /><br />
--------------------------------------------------------------------<br /><br />
Get the clicked tile information:<br />
<b>TMX_Parser.findTileFromIsoCoords(map_name, isoX, isoY);</b> <b>[object]</b><br />
<b>@param</b> map_name: Pure name of TMX file <b>[string]</b><br />
<b>@param</b> isoX: Isometric X coordinate of cursor. <b>[number]</b><br />
<b>@param</b> isoY: Isometric Y coordinate of cursor. <b>[number]</b><br /><br />
--------------------------------------------------------------------<br /><br />
# Events
If you want to run specific function when image loaded, then add event listener on document named by "TMX_Parser_tileset_loaded" with param.<br/><br/>
document.addEventListener("<b>TMX_Parser_tileset_loaded</b>",function(event){<br/>
    var information = event.information; //<b>@return: { totalTileset : X, loadedTileset : X }</b><br/>
});
