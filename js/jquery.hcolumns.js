// hColumns
// ===============
(function($) {
    //
    // Default values
    // -----------------

    // Default Config
    // 
    var defaultConfig = {
        nodeSource: function() {
            return window.alert("dummy source, you need to create a node source");
        },

        noContentString: "There is no node here",

        labelText_maxLength: 15,

        customNodeTypeIndicator: {},
        customNodeTypeHandler: {}
    };
    
    var defaultHandler = {
        folder: function(hColumn, node, data) {
            hColumn.nodeSource( data.id, function(err, data) {
                if(err) {
                    return $.error(err);
                }

                return hColumn.columnView._addColumnList(data, hColumn.columnView);
            });
        },

        link: function(hColumn, node, data) {
            return window.open( data.url );
        }
    };

    var defaultIndicator = {
        folder: "icon-chevron-right",
        link: "icon-globe"
    };

    var methods = {
        init: function(options) {
            // extend the original default value with user input
            var settings = $.extend(defaultConfig , options);
            var handlers = $.extend(defaultHandler, settings.customNodeTypeHandler);
            var indicators = $.extend(defaultIndicator, settings.customNodeTypeIndicator);
            
            // return methods to the chain
            return this.each(function(){
                var self = $(this),
                    data = self.data("columnView");
                
                // bind settings to columnview
                methods.settings = settings;

                // bind columnview and handler to the setings
                settings.columnView = methods;
                settings.handlers = handlers;
                settings.indicators = indicators;

                settings.container_node = this;
                
                // if this new html node is not activated hColumn
                if (!data) {
                    // we assign column view to our setting object
                    self.data("hColumn", settings);

                    // this container should add class for styling
                    self.addClass("column-view-container");
                    
                    // add a composition div inside
                    $("<div></div>").addClass("column-view-composition").appendTo(self);

                    // each node clicked should call this function
                    self.on("click", ".column ul li", settings.columnView._entryClick);
                    
                    // inital load
                    settings.nodeSource(null, function(err, data) {
                        if(err) {
                            return $.error(err);
                        }

                        return settings.columnView._addColumnList(data);
                    });
                }
            });
        },

        _entryClick: function() {
            var columnView = $(this).parents(".column-view-container").data("hColumn");

            var current_container = $(this).parents(".column-view-container");

            var current_click_column = $(this).parents(".column");
            var current_click_level = $(this).parents(".column").index();

            var current_node_type = $(this).data("node-type");
            var current_node_data = $(this).data("node-data");

            // remove another subcolumns
            $(current_container).find(".column-view-composition .column:gt(" + current_click_level + ")").remove();

            // remove other active, and add clicked as active
            current_click_column.find(".active").removeClass("active");
            $(this).addClass("active");

            // redriect to different process model
            return columnView.handlers[current_node_type](columnView, this, current_node_data);
        },

        _addColumnList: function(list, columnView) {
            var self = (!columnView) ? this : columnView;

            var ListElm = $("<ul></ul>");

            if(list.length === 0) {
                var NoContentElm = $("<p></p>").text(columnView.settings.noContentString);

                return self._addColumn(NoContentElm, self);
            }

            list.map(function(entry) {
                // we create the element
                var EntryElm = $("<li></li>").data("node-id", entry.id).data("node-type", entry.type).data("node-data", entry);
                var EntryIconElm = $("<i></i>").addClass( self.settings.indicators[entry.type] );
                
                // label cut string
                if( entry.label.length > self.settings.labelText_maxLength ) {
                    entry.label = entry.label.substring(0, (self.settings.labelText_maxLength - 3) ) + "...";
                }
                
                // we build the node entry
                EntryElm.append( document.createTextNode(entry.label) );
                EntryElm.append(EntryIconElm);

                EntryElm.appendTo(ListElm);
            });

            return self._addColumn(ListElm, self);
        },

        _addColumn: function(content_dom_node, columnView) {
            // create new column div
            var ColumnElm = $("<div></div>").addClass("column");

            // append the content
            ColumnElm.append(content_dom_node);

            // append this new coumn to the composition
            $(columnView.settings.container_node).find(".column-view-composition").append(ColumnElm);

            // scroll to the most right position (the place shows the latest click result)
            $(columnView.settings.container_node).scrollLeft( $(".column-view-composition").width() );
        }
    };   

    $.fn.hColumns = function( method ) {
        // Method calling logic
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.hColumns' );
        }    
    };
})(jQuery);
