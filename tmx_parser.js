//=============================================================================
// TMX File Parser v1.0 (Based on Tiled Map Editor)
// ----------------------------------------------------------------------------
// Author : Ege Bilecen
// Website: egebilecen.tk 
// ----------------------------------------------------------------------------
// Required scripts: jQuery
// ----------------------------------------------------------------------------
// Notes:
// 1. Render order is static and starting from "Left Up".
//=============================================================================
var TMX_Parser = {
    //-Functions
    init : function(canvas,_debug){
        if(_debug === null || typeof _debug === "undefined" || typeof _debug !== "boolean") _debug = false;
        this.settings["ctx"]   = canvas.getContext("2d");
        this.settings["debug"] = _debug; 
        return;
    },
    load : function(fileName,_autoRun){
        if(_autoRun === null || typeof _autoRun === "undefined" || typeof _autoRun !== "boolean") _autoRun = false;
        $.ajax({
            url  : fileName,
            type : "get",
            dataType : "text",
            success  : function(data){
                TMX_Parser.file.name   = fileName;
                TMX_Parser.file.data   = data;
                TMX_Parser.file.status = 1;
                if(_autoRun) TMX_Parser.run();
            },
            error    : function(){
                console.log("!!! - TMX Parser - Cannot load file ("+fileName+").");
            }
        });
    },
    run : function(){
        if( this.file.status === 1 )
        {
            if(this.settings.debug) console.log("??? - TMX Parser - Starting to parsing.");

            var xmlData      = new DOMParser().parseFromString(this.file.data,"text/xml").getElementsByTagName("map")[0];
            this.file["xml"] = xmlData;

            //-Orientation
            this.information["orientation"] = xmlData.getAttribute("orientation");

            //-Render Order
            this.information["renderOrder"] = xmlData.getAttribute("renderorder");

            //-Map Width (Tile)
            this.information["mapWidth"]    = parseInt(xmlData.getAttribute("width"));

            //-Map Height (Tile)
            this.information["mapHeight"]   = parseInt(xmlData.getAttribute("height"));

            //-Tile Width
            this.information["tileWidth"]   = parseInt(xmlData.getAttribute("tilewidth"));

            //-Tile Height
            this.information["tileHeight"]  = parseInt(xmlData.getAttribute("tileheight"));

            //------------------------------------------------------------------------//

            //-Tilesets
            var tilesets = xmlData.getElementsByTagName("tileset");
            this.watcher.tilesets.totalCount = tilesets.length;

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
                this.tilesets.all[tilesetName] = {
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

                var img    = new Image();
                img.src    = orginalImg.getAttribute("source");
                img.setAttribute("data-name",tilesetName);
                img.onload = function(){
                    var _imgName = this.getAttribute("data-name");
                    TMX_Parser.tilesets.all[_imgName].img    = this;
                    TMX_Parser.tilesets.all[_imgName].source = this.src;
                    TMX_Parser.tilesets.all[_imgName].status = 1;
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
            for( var tilesetName in this.all )
            {
                if(!this.all.hasOwnProperty(tilesetName)) continue;

                var tileset = this.all[tilesetName];

                if( tileId >= tileset.firstgid && tileId <= ((tileset.tilesetCount - 1) + tileset.firstgid) )
                    return tileset;
            }
        },
        loaded : function(){
            TMX_Parser.watcher.tilesets.currentCount++;
            if( TMX_Parser.watcher.tilesets.currentCount === TMX_Parser.watcher.tilesets.totalCount )
            {
                if(TMX_Parser.settings.debug) console.log("??? - TMX Parser - All tilesets loaded. ("+TMX_Parser.watcher.tilesets.currentCount+"/"+TMX_Parser.watcher.tilesets.totalCount+")");
                TMX_Parser.layers.startRendering();
            }
        },
        all : {}
    },
    layers : {
        startRendering : function(){
            if(TMX_Parser.settings.debug) console.log("??? - TMX Parser - Starting to rendering layer datas.");
            
            //-Layers
            var layers = TMX_Parser.file.xml.getElementsByTagName("layer");

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
                for( var _j=0; _j < layerBadData.length / TMX_Parser.information.mapWidth; _j++ )
                {
                    var croppedData = layerBadData.slice(lastIndex,lastIndex+TMX_Parser.information.mapWidth);
                    layerGoodData.push(croppedData);
                    lastIndex = lastIndex + TMX_Parser.information.mapWidth;
                }

                TMX_Parser.layers.all[layerName] = {
                    name   : layerName,
                    width  : parseInt(layerWidth),
                    height : parseInt(layerHeight),
                    data   : layerGoodData
                };
            }
            if(TMX_Parser.settings.debug) console.log("??? - TMX Parser - All layer datas rendered. For draw them on canvas, please run \"TMX_Parser.layers.draw()\" function.");
        },
        draw : function(){
            if(TMX_Parser.settings.debug) console.log("??? - TMX Parser - Drawing layers to the canvas.");
            
            for( var layerName in TMX_Parser.layers.all )
            {
                if(!TMX_Parser.layers.all.hasOwnProperty(layerName)) continue;

                var layer = TMX_Parser.layers.all[layerName];

                for( var h=0; h < layer.data.length; h++ )
                {
                    for( var w=0; w < layer.data[h].length; w++ )
                    {
                        if(layer.data[h][w] === 0) continue;

                        var tileset     = TMX_Parser.tilesets.which(layer.data[h][w]); //return: tileset
                        var limitPerRow = tileset.img.width / tileset.tileWidth;
                        var posWidth    = layer.data[h][w] - tileset.firstgid;
                        var posHeight   = 0;

                        if( posWidth > limitPerRow )
                        {
                            posHeight = posHeight + Math.floor(posWidth / limitPerRow);
                            posWidth  = posWidth % limitPerRow;
                        }

                        TMX_Parser.settings.ctx.beginPath();
                        TMX_Parser.settings.ctx.drawImage(
                            tileset.img, //img
                            posWidth * tileset.tileWidth, posHeight * tileset.tileHeight, //start crop x, start crop y
                            tileset.tileWidth,tileset.tileHeight, //clipped img width, clipped img height
                            w * tileset.tileWidth, h * tileset.tileHeight, //draw pos. x, draw pos. y
                            tileset.tileWidth, tileset.tileHeight //img width, img height (optinal)
                        );
                        TMX_Parser.settings.ctx.closePath();
                    }
                }
            }
        },
        all : {}
    },
    watcher  : {
        tilesets : {
            totalCount   : 0,
            currentCount : 0
        }
    },

    //-Variables
    file : { //file that will be parsed
        name : null,
        data : null,
        status : 0 // 0: not loaded, 1: loaded
    },
    information : {} //gives general information
};
