# How To Use?
Initialize the parser:<br />
<b>TMX_Parser.init(canvas, draw_mode, debug);</b><br />
<b>@param</b> canvas: Reference of canvas element. <b>[HTML Object]</b><br />
<b>@param</b> draw_mode: Mode of Parser. (1: <b>Orthogonal</b>, 2: <b>Isometric</b>) <b>[number]</b><br />
<b>@param</b> debug: are debug messages will be shown? <b>[true/false]</b> - default: <b>false</b><br /><br />
--------------------------------------------------------------------<br /><br />
Change draw mode:<br />
<b>TMX_Parser.changeDrawMode(mode);</b><br />
<b>@param</b> mode: Mode of Parser. (1: <b>Orthogonal</b>, 2: <b>Isometric</b>) <b>[number]</b><br /><br />
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
<b>TMX_Parser.IsoToCoords(x, y, tileWidth, tileHeight);</b> <b>[object]</b><br />
<b>@param</b> x: Map matrix X position. <b>[number]</b><br />
<b>@param</b> y: Map matrix Y position. <b>[number]</b><br />
<b>@param</b> tileWidth : Tile width. <b>[number]</b><br />
<b>@param</b> tileHeight: Tile height. <b>[number]</b><br /><br />
--------------------------------------------------------------------<br /><br />
Convert Page coordinates to Isometric coordinates:<br />
<b>TMX_Parser.CoordsToCell(map_name, pageX, pageY);</b> <b>[object]</b><br />
<b>@param</b> map_name: Pure name of TMX file <b>[string]</b><br />
<b>@param</b> pageX: X position of mouse cursor at page. <b>[number]</b><br />
<b>@param</b> pageY: Y position of mouse cursor at page. <b>[number]</b><br />
--------------------------------------------------------------------<br /><br />
Get the clicked tile information:<br />
<b>TMX_Parser.findTileFromCellCoords(map_name, cellX, cellY);</b> <b>[object]</b><br />
<b>@param</b> map_name: Pure name of TMX file <b>[string]</b><br />
<b>@param</b> cellX: Cell X coordinate of cursor. <b>[number]</b><br />
<b>@param</b> cellY: Cell Y coordinate of cursor. <b>[number]</b><br /><br />
--------------------------------------------------------------------<br /><br />
# Camera
Camera offsets will be automatically applied when "draw()" function invoked.<br />
Set offsets of x and y:<br />
<b>TMX_Parser.setOffset(x, y);</b> <b>[void]</b><br />
<b>@param</b> x: Distance based on X axis. <b>[number]</b><br />
<b>@param</b> y: Distance based on Y axis. <b>[number]</b><br /><br />
If <b>null</b> passed as paramater, old offset value will be keeped.<br />
--------------------------------------------------------------------<br /><br />
Set offset x and y to 0:<br />
<b>TMX_Parser.resetOffset();</b> <b>[void]</b><br /><br />
--------------------------------------------------------------------<br /><br />
Update offset x and y based on <b>TMX_Parser.camera.speed.[X/Y]</b> values:<br />
<b>TMX_Parser.updateOffset(x_direction, y_direction);</b> <b>[void]</b><br />
<b>@param</b> x_direction: Can be <b>1</b> or <b>2</b>. <b>[number]</b><br />
<b>@param</b> y_direction: Can be <b>1</b> or <b>2</b>. <b>[number]</b><br /><br />
<b>1</b> is increment, <b>2</b> is abatement. Any value that is not a <b>number</b> will be treated as <b>do nothing</b>.<br />
--------------------------------------------------------------------<br /><br />
<b>Note:</b> If you want to change camera speed ...<br/>
TMX_Parser.<b>camera.speed.x</b> = 10 # set your speed <br/>
TMX_Parser.<b>camera.speed.y</b> = 10 # set your speed <br/>
... do it in this way.<br /><br />
--------------------------------------------------------------------<br /><br />
# Events
If you want to run specific function when image loaded, then add event listener on document named by "TMX_Parser_tileset_loaded" with param.<br/><br/>
document.addEventListener("<b>TMX_Parser_tileset_loaded</b>",function(event){<br/>
    var information = event.information; //<b>@return: { totalTileset : X, loadedTileset : X }</b><br/>
});<br />
--------------------------------------------------------------------<br /><br />
After all tilesets loaded, layer rendering will be started. After layer rendering is over, "TMX_Parser_layers_rendered" event will be fired. After this event fired, it means everything is ready to draw tiles.<br/><br/>
document.addEventListener("<b>TMX_Parser_layers_rendered</b>",function(event){<br/>
    //example codes:<br />
    TMX_Parser.camera.setOffset(250, 250);<br />
    TMX_Parser.layers.draw();<br />
});<br />
