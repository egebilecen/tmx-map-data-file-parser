//=============================================================================
// TMX File Parser v2.0 (Based on Tiled Map Editor)
// ----------------------------------------------------------------------------
// Author : Ege Bilecen
// Website: egebilecen.info
// ----------------------------------------------------------------------------
// Required scripts: jQuery
// ----------------------------------------------------------------------------
// Notes:
// 1. Render order is static and starting from "Left Up".
//=============================================================================
var TMX_Parser = {
    //-Functions
    init : function(ctx, draw_mode, _debug){
        if(typeof _debug !== "boolean") _debug = false;

        this.settings["ctx"]   = ctx;
        this.settings["debug"] = _debug;
        this.changeDrawMode(draw_mode);
    },
    changeDrawMode : function(mode) {
        var _modes = [1, 2];
        if(typeof mode !== "number" || _modes.indexOf(mode) === -1)
        {
            console.log("!!! - TMX Parser - Unkown draw mode.");
            return false;
        }

        this.settings["draw_mode"] = mode;
    },
    load : function(filePath, tilesetDirPath, _autoRun){
        if(_autoRun === null || typeof _autoRun === "undefined" || typeof _autoRun !== "boolean") _autoRun = false;
        TMX_Parser.watcher.all.maps.totalCount++;
        $.ajax({
            url  : filePath,
            type : "get",
            dataType : "text",
            success  : function(data){
                var VdZcW = filePath.split("/");
                var lHWIj = VdZcW[VdZcW.length - 1].split(".");

                var pureName = lHWIj[lHWIj.length - 2];
                var name     = VdZcW[VdZcW.length - 1];
                var path     = filePath;
                var status   = 1;

                TMX_Parser.file.all[pureName] = {
                    pureName : pureName,
                    name     : name,
                    path     : path,
                    data     : data,
                    status   : status
                };

                TMX_Parser.watcher.all.tilesets.baseDir = tilesetDirPath;
                TMX_Parser.watcher.switchFile(pureName);

                TMX_Parser.watcher.all.maps.currentCount++;

                //create event
                TMX_Parser.createNewEvent("TMX_Parser_map_loaded", "information", {
                    totalMap   : TMX_Parser.watcher.all.maps.totalCount,
                    currentMap : TMX_Parser.watcher.all.maps.currentCount
                });

                if(_autoRun)
                {
                    if(TMX_Parser.watcher.switchFile(pureName))
                        TMX_Parser.run();
                    else console.log("!!! - TMX Parser - File for switching is not found! ("+pureName+")");
                }
            },
            error : function(){
                console.log("!!! - TMX Parser - Cannot load file ("+filePath+").");
            }
        });
    },
    run : function(){
        var FILE = TMX_Parser.file.all[TMX_Parser.watcher.all.file.pureName];
        if( FILE.status === 1 )
        {
            if(this.settings.debug) console.log("??? - TMX Parser - Starting to parsing.");

            //-Reset watcher
            this.watcher.reset();

            var xmlData      = new DOMParser().parseFromString(FILE.data,"text/xml").getElementsByTagName("map")[0];
            this.information[FILE.pureName] = {};
            FILE["xml"] = xmlData;

            //-Orientation
            this.information[FILE.pureName]["orientation"] = xmlData.getAttribute("orientation");

            //-Render Order
            this.information[FILE.pureName]["renderOrder"] = xmlData.getAttribute("renderorder");

            //-Map Width (Tile)
            this.information[FILE.pureName]["mapWidth"]    = parseInt(xmlData.getAttribute("width"));

            //-Map Height (Tile)
            this.information[FILE.pureName]["mapHeight"]   = parseInt(xmlData.getAttribute("height"));

            //-Tile Width
            this.information[FILE.pureName]["tileWidth"]   = parseInt(xmlData.getAttribute("tilewidth"));

            //-Tile Height
            this.information[FILE.pureName]["tileHeight"]  = parseInt(xmlData.getAttribute("tileheight"));

            //------------------------------------------------------------------------//

            //-Tilesets
            var tilesets = xmlData.getElementsByTagName("tileset");
            this.tilesets.all[FILE.pureName] = {};
            this.watcher.all.tilesets.totalCount = tilesets.length;

            for( var _i=0; _i < tilesets.length; _i++ )
            {
                var tileset = tilesets[_i];

                //-Tileset's attributes
                var tilesetFirst_gId  = parseInt(tileset.getAttribute("firstgid"));
                var tilesetName       = tileset.getAttribute("name");
                var tilesetTileWidth  = parseInt(tileset.getAttribute("tilewidth"));
                var tilesetTileHeight = parseInt(tileset.getAttribute("tileheight"));
                var tilesetTileCount  = parseInt(tileset.getAttribute("tilecount"));

                //-Create tileset on this.tilesets
                this.tilesets.all[FILE.pureName][tilesetName] = {
                    name         : tilesetName,
                    firstgid     : tilesetFirst_gId,
                    tileWidth    : tilesetTileWidth,
                    tileHeight   : tilesetTileHeight,
                    tilesetCount : tilesetTileCount,
                    img          : null, //Image() object
                    source       : null,
                    status       : 0 // 0: not loaded, 1: loaded
                };

                var orginalImg = tileset.getElementsByTagName("image")[0];

                var source = orginalImg.getAttribute("source").split("/");
                source     = source[source.length - 1];

                var img    = new Image();
                img.src    = TMX_Parser.watcher.all.tilesets.baseDir + source;
                img.setAttribute("data-name",tilesetName);
                img.onload = function(){
                    var _imgName = this.getAttribute("data-name");
                    TMX_Parser.tilesets.all[FILE.pureName][_imgName].img    = this;
                    TMX_Parser.tilesets.all[FILE.pureName][_imgName].source = this.src;
                    TMX_Parser.tilesets.all[FILE.pureName][_imgName].status = 1;
                    TMX_Parser.tilesets.loaded();
                }
            }

        }
        else console.log("!!! - TMX Parser - Please load a file.");
    },

    //-Objects
    settings : {},
    tilesets : {
        which : function(tileId){
            for( var tilesetName in this.all[TMX_Parser.watcher.all.file.pureName] )
            {
                if(!this.all[TMX_Parser.watcher.all.file.pureName].hasOwnProperty(tilesetName)) continue;

                var tileset = this.all[TMX_Parser.watcher.all.file.pureName][tilesetName];

                if( tileId >= tileset.firstgid && tileId <= ((tileset.tilesetCount - 1) + tileset.firstgid) )
                    return tileset;
            }
        },
        loaded : function(){
            TMX_Parser.watcher.all.tilesets.currentCount++;
            if( TMX_Parser.watcher.all.tilesets.currentCount === TMX_Parser.watcher.all.tilesets.totalCount )
            {
                if(TMX_Parser.settings.debug) console.log("??? - TMX Parser - All tilesets loaded. ("+TMX_Parser.watcher.all.tilesets.currentCount+"/"+TMX_Parser.watcher.all.tilesets.totalCount+")");
                TMX_Parser.layers.startRendering();
            }

            //-Create event
            TMX_Parser.createNewEvent("TMX_Parser_tileset_loaded", "information", {
                totalTileset : TMX_Parser.watcher.all.tilesets.totalCount,
                loadedTileset : TMX_Parser.watcher.all.tilesets.currentCount
            });
        },
        all : {}
    },
    layers : {
        startRendering : function(){
            if(TMX_Parser.settings.debug) console.log("??? - TMX Parser - Starting to rendering layer datas.");

            //-Layers
            var layers = TMX_Parser.file.all[TMX_Parser.watcher.all.file.pureName].xml.getElementsByTagName("layer");

            TMX_Parser.layers.all[TMX_Parser.watcher.all.file.pureName] = {};

            for( var _i=0; _i < layers.length; _i++ )
            {
                var layer = layers[_i];

                //-Layer's attributes
                var layerName   = layer.getAttribute("name");
                var layerWidth  = parseInt(layer.getAttribute("width")); //tile
                var layerHeight = parseInt(layer.getAttribute("height")); //tile

                //-Render Layer's Matrix
                var layerBadData = layer.getElementsByTagName("data")[0].innerHTML.trim().split(",").map(function(id){
                    return parseInt(id);
                });

                //-Re-edit Bad Layer Data
                var lastIndex     = 0;
                var layerGoodData = [];
                for( var _j=0; _j < layerBadData.length / TMX_Parser.information[TMX_Parser.watcher.all.file.pureName].mapWidth; _j++ )
                {
                    var croppedData = layerBadData.slice(lastIndex,lastIndex+TMX_Parser.information[TMX_Parser.watcher.all.file.pureName].mapWidth);
                    layerGoodData.push(croppedData);
                    lastIndex = lastIndex + TMX_Parser.information[TMX_Parser.watcher.all.file.pureName].mapWidth;
                }

                TMX_Parser.layers.all[TMX_Parser.watcher.all.file.pureName][layerName] = {
                    name   : layerName,
                    width  : parseInt(layerWidth),
                    height : parseInt(layerHeight),
                    data   : layerGoodData
                };
            }
            if(TMX_Parser.settings.debug) console.log("??? - TMX Parser - All layer datas rendered. For draw them on canvas, please run \"TMX_Parser.layers.draw()\" function.");

            document.addEventListener("keydown", function(e){
                var keyCode = e.keyCode;

                switch (keyCode)
                {
                    case 87: // W
                        TMX_Parser.keys.W.status = true;
                    break;

                    case 65: // A
                        TMX_Parser.keys.A.status = true;
                    break;

                    case 83: // S
                        TMX_Parser.keys.S.status = true;
                    break;

                    case 68: // D
                        TMX_Parser.keys.D.status = true;
                    break;
                }
            });

            document.addEventListener("keyup", function(e){
                var keyCode = e.keyCode;

                switch (keyCode)
                {
                    case 87: // W
                        TMX_Parser.keys.W.status = false;
                    break;

                    case 65: // A
                        TMX_Parser.keys.A.status = false;
                    break;

                    case 83: // S
                        TMX_Parser.keys.S.status = false;
                    break;

                    case 68: // D
                        TMX_Parser.keys.D.status = false;
                    break;
                }
            });

            //-Create event
            TMX_Parser.createNewEvent("TMX_Parser_layers_rendered");
        },
        drawGrid : function(x, y, tileWidth, tileHeight, style, mode){
            //Modes:
            // 1-Stroke, 2-Fill
            //@param style: {color:"#XXX", alpha:1.0}

            TMX_Parser.settings.ctx.beginPath();

            TMX_Parser.settings.ctx.globalAlpha   = style.alpha;

            TMX_Parser.settings.ctx.strokeStyle   = style.color;
            if(mode === 2)
                TMX_Parser.settings.ctx.fillStyle = style.color;

            if(TMX_Parser.settings.draw_mode === 1) //orthogonal
            {
                TMX_Parser.settings.ctx.moveTo(x, y);

                //left
                TMX_Parser.settings.ctx.lineTo(x, y + tileHeight);

                //bottom
                TMX_Parser.settings.ctx.lineTo(x + tileWidth, y + tileHeight);

                //right
                TMX_Parser.settings.ctx.lineTo(x + tileWidth, y);

                //top
                TMX_Parser.settings.ctx.lineTo(x, y);
            }
            else if(TMX_Parser.settings.draw_mode === 2) //isometric
            {
                TMX_Parser.settings.ctx.moveTo(x + tileWidth/2, y);

                //left
                TMX_Parser.settings.ctx.lineTo(x + tileWidth, y + tileHeight/2);

                //top
                TMX_Parser.settings.ctx.lineTo(x + tileWidth, y + tileHeight/2);

                //right
                TMX_Parser.settings.ctx.lineTo(x + tileWidth/2, y + tileHeight);

                //bottom
                TMX_Parser.settings.ctx.lineTo(x, y + tileHeight/2);
            }

            TMX_Parser.settings.ctx.closePath();

            TMX_Parser.settings.ctx.stroke();
            if(mode === 2)
                TMX_Parser.settings.ctx.fill();

            TMX_Parser.settings.ctx.globalAlpha = 1.0;
        },
        draw : function(){
            if(TMX_Parser.settings.debug) console.log("??? - TMX Parser - Drawing layers to the canvas.");

            //Update offsets if key press present
            if(TMX_Parser.keys.W.status)
                TMX_Parser.camera.updateOffset(null, 1);
            if(TMX_Parser.keys.S.status)
                TMX_Parser.camera.updateOffset(null, 2);
            if(TMX_Parser.keys.A.status)
                TMX_Parser.camera.updateOffset(1, null);
            if(TMX_Parser.keys.D.status)
                TMX_Parser.camera.updateOffset(2, null);

            for( var layerName in TMX_Parser.layers.all[TMX_Parser.watcher.all.file.pureName] )
            {
                if(!TMX_Parser.layers.all[TMX_Parser.watcher.all.file.pureName].hasOwnProperty(layerName)) continue;

                var layer = TMX_Parser.layers.all[TMX_Parser.watcher.all.file.pureName][layerName];

                for( var y=0; y < layer.data.length; y++ )
                {
                    for( var x=0; x < layer.data[y].length; x++ )
                    {
                        if(layer.data[y][x] === 0) continue;

                        var tileset     = TMX_Parser.tilesets.which(layer.data[y][x]); //return: tileset
                        var limitPerRow = tileset.img.width / tileset.tileWidth;
                        var posWidth    = layer.data[y][x] - tileset.firstgid;
                        var posHeight   = 0;

                        if( posWidth >= limitPerRow )
                        {
                            posHeight = posHeight + Math.floor(posWidth / limitPerRow);
                            posWidth  = posWidth % limitPerRow;
                        }

                        var tile = {
                            draw_position : {
                                x : x * tileset.tileWidth,
                                y : y * tileset.tileHeight
                            }
                        };

                        //if draw mode isometric
                        if(TMX_Parser.settings.draw_mode === 2)
                        {
                            //iso to draw coords conversition
                            tile.draw_position = TMX_Parser.layers.CellToCoords(x, y, tileset.tileWidth, tileset.tileHeight);
                        }

                        //add offsets
                        tile.draw_position.x += TMX_Parser.camera.offset.x;
                        tile.draw_position.y += TMX_Parser.camera.offset.y;

                        TMX_Parser.settings.ctx.beginPath();
                        TMX_Parser.settings.ctx.drawImage(
                            tileset.img, //img
                            posWidth * tileset.tileWidth, posHeight * tileset.tileHeight, //start crop x, start crop y
                            tileset.tileWidth,tileset.tileHeight, //clipped img width, clipped img height
                            tile.draw_position.x, tile.draw_position.y, //draw pos. x, draw pos. y
                            tileset.tileWidth, tileset.tileHeight //img width, img height (optinal)
                        );
                        TMX_Parser.settings.ctx.closePath();

                        //draw grid if enabled
                        if(TMX_Parser.grid.is_enable)
                        {
                            TMX_Parser.layers.drawGrid(tile.draw_position.x, tile.draw_position.y,
                                tileset.tileWidth, tileset.tileHeight,
                                TMX_Parser.grid.style, 1);
                        }
                    }
                }
            }

            //if hover enabled
            if(TMX_Parser.grid.hover.is_enable)
            {
                var coords = TMX_Parser.layers.CellToCoords(TMX_Parser.grid.hover.coords.cellX, TMX_Parser.grid.hover.coords.cellY, tileset.tileWidth, tileset.tileHeight);
                TMX_Parser.layers.drawGrid(coords.x + TMX_Parser.camera.offset.x, coords.y + TMX_Parser.camera.offset.y,
                    tileset.tileWidth, tileset.tileHeight,
                    TMX_Parser.grid.hover.style, 2);
            }
        },
        CellToCoords : function(x, y, tileWidth, tileHeight){
            if(TMX_Parser.settings.draw_mode === 1)
            {
                return {
                    x : x * tileWidth,
                    y : y * tileHeight
                };
            }
            else if(TMX_Parser.settings.draw_mode === 2)
            {
                return {
                    x : (x - y) * tileWidth / 2,
                    y : (x + y) * tileHeight / 2
                };
            }
        },
        CoordsToCell : function(map_name, pageX, pageY){
            var realX = pageX - TMX_Parser.camera.offset.x;
            var realY = pageY - TMX_Parser.camera.offset.y;

            if(TMX_Parser.settings.draw_mode === 1)
            {
                var cellX = Math.floor(realX / TMX_Parser.information[map_name].tileWidth);
                var cellY = Math.floor(realY / TMX_Parser.information[map_name].tileHeight);

                if(cellX < 0)
                    cellX = 0;
                else if(cellX > TMX_Parser.information[map_name].mapWidth - 1)
                    cellX = TMX_Parser.information[map_name].mapWidth - 1;

                if(cellY < 0)
                    cellY = 0;
                else if(cellY> TMX_Parser.information[map_name].mapHeight - 1)
                    cellY = TMX_Parser.information[map_name].mapHeight - 1;

                return {
                    cellX : cellX,
                    cellY : cellY
                };
            }
            else if(TMX_Parser.settings.draw_mode === 2)
            {
                realX  -= TMX_Parser.information[map_name].tileWidth/2;

                var isoX = Math.floor((realY / TMX_Parser.information[map_name].tileHeight) + (realX / TMX_Parser.information[map_name].tileWidth));
                var isoY = Math.floor((realY / TMX_Parser.information[map_name].tileHeight) - (realX / TMX_Parser.information[map_name].tileWidth));

                if(isoX < 0)
                    isoX = 0;
                else if(isoX > TMX_Parser.information[map_name].mapWidth - 1)
                    isoX = TMX_Parser.information[map_name].mapWidth - 1;

                if(isoY < 0)
                    isoY = 0;
                else if(isoY > TMX_Parser.information[map_name].mapHeight - 1)
                    isoY = TMX_Parser.information[map_name].mapHeight - 1;

                return {
                    cellX : isoX,
                    cellY : isoY
                };
            }
        },
        findTileFromCellCoords : function(map_name, cellX, cellY){
            var result = [];
            var mapWidth  = TMX_Parser.information[map_name].mapWidth;
            var mapHeight = TMX_Parser.information[map_name].mapHeight;

            //check if iso coords in boundaries
            if((cellX < 0 || cellX > mapWidth) || (cellY < 0 || cellY > mapHeight))
                return false;

            for(var layerName in TMX_Parser.layers.all[map_name])
            {
                var layer  = TMX_Parser.layers.all[map_name][layerName];
                var tileId = layer.data[cellY][cellX];

                if(tileId !== 0)
                {
                    result.push(
                        {
                            layerName : layerName,
                            tileId    : tileId
                        }
                    );
                }
            }

            return result;
        },
        all : {}
    },
    watcher  : {
        all : {
            maps : {
              totalCount : 0,
              currentCount : 0
            },
            tilesets : {
                totalCount   : 0,
                currentCount : 0,
                baseDir      : null
            },
            file : {
                pureName : null
            }
        },
        reset : function(){
            //-Tilesets
            this.all.tilesets.totalCount   = 0;
            this.all.tilesets.currentCount = 0;
        },
        switchFile : function(filePureName){
            if(TMX_Parser.file.all.hasOwnProperty(filePureName))
            {
                TMX_Parser.camera.resetOffset();
                TMX_Parser.watcher.all.file.pureName = filePureName;
                return true;
            }
            else return false;
        }
    },

    //-Variables
    file : { //file that will be parsed
        all : {},
        // name : null,
        // data : null,
        // status : 0 // 0: not loaded, 1: loaded
    },
    information : {}, //gives general information
    camera : {
        setOffset : function (x, y) {
            if(typeof x !== "number")
                x = TMX_Parser.camera.offset.x || 0;
            if(typeof y !== "number")
                y = TMX_Parser.camera.offset.y || 0;

            TMX_Parser.camera.offset.x = x;
            TMX_Parser.camera.offset.y = y;
        },
        resetOffset : function() {
            TMX_Parser.camera.offset.x = 0;
            TMX_Parser.camera.offset.y = 0;
        },
        updateOffset : function(x_direction, y_direction){
            if(typeof x_direction !== "number")
                x_direction = null;
            if(x_direction < 1 && x_direction > 2)
                console.log("??? - TMX_Parser - updateOffset(): Wrong direction for X offset.");

            if(typeof y_direction !== "number")
                y_direction = null;
            if(y_direction < 1 && y_direction > 2)
                console.log("??? - TMX_Parser - updateOffset(): Wrong direction for Y offset.");

            if(x_direction === 1) //increase offset x
                TMX_Parser.camera.setOffset(TMX_Parser.camera.offset.x + TMX_Parser.camera.speed.x,null);
            else if(x_direction === 2) //decrease offset x
                TMX_Parser.camera.setOffset(TMX_Parser.camera.offset.x - TMX_Parser.camera.speed.x,null);

            if(y_direction === 1) //increase offset x
                TMX_Parser.camera.setOffset(null, TMX_Parser.camera.offset.y + TMX_Parser.camera.speed.y);
            else if(y_direction === 2) //decrease offset x
                TMX_Parser.camera.setOffset(null, TMX_Parser.camera.offset.y - TMX_Parser.camera.speed.y);
        },
        offset : {
            x : 0,
            y : 0
        },
        speed : {
            x : 10,
            y : 10
        }
    },
    keys : {
        W : { status:false },
        A : { status:false },
        S : { status:false },
        D : { status:false }
    },
    grid : {
        is_enable : 0,
        style : {
          color : "#000",
          alpha : 1.0
        },
        toggleGrid : function(){
            switch (TMX_Parser.grid.is_enable)
            {
                case 1: //disable the grid
                    TMX_Parser.grid.is_enable = 0;
                break;

                case 0: //enable the grid
                    TMX_Parser.grid.is_enable = 1;
                break;
            }
            return TMX_Parser.grid.is_enable;
        },
        setStyle : function(color, alpha) {
            if(typeof color !== "string")
                color = "#000";
            if(typeof alpha !== "number")
                alpha = 1.0;

            TMX_Parser.grid.style.color = color;
            TMX_Parser.grid.style.alpha = alpha;
        },
        hover : {
            is_enable : 0,
            style : {
              color : "#fff",
              alpha : 1.0
            },
            coords : {
              cellX : 0,
              cellY : 0
            },
            toggleHover : function () {
                switch (TMX_Parser.grid.hover.is_enable)
                {
                    case 1: //disable the grid
                        TMX_Parser.grid.hover.is_enable = 0;
                        break;

                    case 0: //enable the grid
                        TMX_Parser.grid.hover.is_enable = 1;
                        break;
                }
                return TMX_Parser.grid.hover.is_enable;
            },
            setStyle : function(color, alpha) {
                if(typeof color !== "string")
                    color = "#000";
                if(typeof alpha !== "number")
                    alpha = 1.0;

                TMX_Parser.grid.hover.style.color = color;
                TMX_Parser.grid.hover.style.alpha = alpha;
            }
        }
    },
    createNewEvent : function (event_name, property, data) {
        if(typeof property !== "string")
            property = null;
        if(typeof data !== "object")
            data = {};

        //-Create event
        var event = document.createEvent("Event");
        event.initEvent(event_name);
        if(property !== null)
            event[property] = data;
        document.dispatchEvent(event);
    }
};
