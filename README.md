# How To Use?
- Initialize the parser:<br />
<b>TMX_Parser.init(canvas,debug);</b><br />
<b>@param</b> canvas: Reference of canvas element. <b>[HTML Object]</b><br />
<b>@param</b> debug: are debug messages will be shown? <b>[true/false]</b> - default: <b>false</b><br /><br />
--------------------------------------------------------------------<br /><br />
<b>TMX_Parser.load(pathOfFile,autoRun);</b><br />
<b>@param</b> pathOfFile: Your file's path that will be parsed. <b>[string]</b><br />
<b>@param</b> autoRun: Start parsing process automatically. <b>[true/false]</b> - default: <b>false</b><br /><br />
--------------------------------------------------------------------<br /><br />
<b>TMX_Parser.run();</b> # Run parsing process manually. <b>[void]</b><br /><br />
--------------------------------------------------------------------<br /><br />
<b>TMX_Parser.draw();</b> # After layers rendered, run for drawing to canvas. (Function will be not fired automatically at currently. Call it manually please.) <b>[void]</b>
