var Sala2 = (function( $, window, undefined ) {
    'use strict';

    var config = {
        url: "https://public-api.wordpress.com/rest/v1/sites/sala2recetario.es/posts/",
        url_ordered: "https://public-api.wordpress.com/rest/v1/sites/sala2recetario.es/posts/?number=100&order_by=title&order=ASC",
        arrCategories: ["Carnes","Cocina en miniatura","Comidas del mundo","ensalada","Entre pan y pan","Galletas","Las recetas de la abuela","Panaderia Sala2","Pescados","Postres","Setas"]
    };

    //REST Service Definition
    var service = function (url,key){
        $.ajax({
            url: url,
            dataType:'jsonp',
            cacheJStorage: true,
            cacheKey: key,
            cacheTTL: 172800,
            isCacheValid: function(){return true;},
            success: function(data) {
            }
        });
    };

    //REST Service Call
    var callService = function(categories){

        //$.jStorage.flush()
        $.each(categories, function(index, category) {
            service(config.url + '?category=' + encodeURIComponent(category),category);
        });
    };

    var getParameterByName = function(name){
        var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    };

    var init = function () {
        var self = this; // assign reference to current object to "self"
        var param; // Category
        var recipeID; //Recipe ID

        $('#splash').live('pageshow', function(){
            //$.jStorage.flush()
            //Call REST service
            //callService(config.arrCategories);

            //load orderedList
            service(config.url_ordered,'orderedList');

            var hideSplash = function() {
                $.mobile.changePage( "#categoryListPage", { transition: "slideup"} );
            };
            setTimeout(hideSplash, 3000);
        });

        $('#categoryListPage').live('pageshow', function(event) {
            $('#categoryList li a').live('click', function() {
                param = $(this).attr("data-param");
            });
        });

        $('#recipeListPage').live('pageshow', function(event) {         
            getRecipeFilterList(param);
        });


        $('#detailsPage').live('pageshow', function(event) {
        
            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s); js.id = id;
                js.src = "//connect.facebook.net/es_LA/all.js#xfbml=1";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));

            console.error("recipeID" + recipeID);
            var id_recipe = recipeID;
            console.error("cat recipe" + param);
            var cat_recipe = param;

            var data_recipe;

            if (cat_recipe !== 'favorites'){
                data_recipe = $.jStorage.get(decodeURIComponent(cat_recipe));
            }
            else{
                data_recipe = $.jStorage.get('orderedList');
            }
            
            var filtered = $.grep(data_recipe.posts, function(el, i) {
                return  el.ID.toString() === id_recipe.toString();
            });

            console.error("filtered " + filtered);

            displayRecipe(filtered);
            //$.jStorage.flush()
            $("#saveFav").click(function() {
                console.error("Salvando");
                var favoritesData = [];
                if(!$.jStorage.get("favorites")){
                    favoritesData = [-1,id_recipe];
                    $.jStorage.set("favorites",favoritesData);
                    
                }else{
                    if ($.inArray(id_recipe,$.jStorage.get("favorites")) === -1){
                        favoritesData = $.jStorage.get("favorites");
                        favoritesData.push(id_recipe);
                        $.jStorage.set("favorites",favoritesData);
                    }
                }
                favoriteList();
            });
        });
        
        $('#favoriteListPage').live('pageshow', function(event) {

        //Check if key are stored
        if (!$.jStorage.get('orderedList')){
            
            //show loading div
            $.mobile.loading( 'show', {
                text: 'Cargando Favoritos...',
                textVisible: true,
                theme: '',
                html: ""
            });

            //load again 
            service(config.url_ordered,'orderedList');

            //Listen if recipe storage change
            $.jStorage.listenKeyChange('orderedList', function(key, action){
                //hide loading div
                $.mobile.loading( 'hide');
                //paint recipe only if action is updated no deleted
                if (action === 'updated'){
                    paintFavoriteList();
                }
            });
        }else{
            paintFavoriteList();
        }
    });

    $('#favoriteList li a').live('click', function() {
        recipeID = $(this).attr("data-recipeID");
        param = $(this).attr("data-param");
    });

    $('#recipeList li a').live('click', function() {
        recipeID = $(this).attr("data-recipeID");
    });

    $('#alphabeticalList li a').live('click', function() {
        recipeID = $(this).attr("data-recipeID");
        param = $(this).attr("data-param");
    });
    
    $('#alphabeticalListPage').live('pageshow', function(event) {

    //Check if key are storaged
        if (!$.jStorage.get('orderedList')){
            
            //show loading div
            $.mobile.loading( 'show', {
                text: 'Cargando listado...',
                textVisible: true,
                theme: '',
                html: ""
            });

            //load again 
            service(config.url_ordered,'orderedList');

            //Listen if recipe storage change
            $.jStorage.listenKeyChange('orderedList', function(key, action){
                //hide loading div
                $.mobile.loading( 'hide');
                //paint recipe only if action is updated no deleted
                if (action === 'updated'){
                    paintList();
                }
            });
        }else{
            paintList();
        }
    });

    };

    var getUrlVars = function(category) {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++){
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
    return vars;
    };

    var getRecipeFilterList = function(cat){
console.error("carnes " + cat);
        $('#recipeList li').remove();

        $('#categoryName').text(cat);
            //Check if key are storaged
            if (!$.jStorage.get(cat)){
                
                //show loading div
                $.mobile.loading( 'show', {
                    text: 'Cargando...',
                    textVisible: true,
                    theme: '',
                    html: ""
                });

                //load again th category
                var arrCat = [cat];
                 callService(arrCat);

                //Listen if recipe storage change
                $.jStorage.listenKeyChange(cat, function(key, action){
                    //hide loading div
                    $.mobile.loading( 'hide');
                    //paint recipe only if action is updated no deleted
                    if (action === 'updated')
                        paintRecipes(cat);
                });

            }else{
                paintRecipes(cat);
            }
        };

    var paintRecipes = function(cat){
        var data = $.jStorage.get(cat);
        
        $.each(data.posts, function(index, categ) {
                   $('#recipeList').append('<li><a data-recipeID="'+ categ.ID +'" href="#detailsPage" data-transition="slide">' +
                        '<img src="' + categ.featured_image + '"></img>' +
                        '<h4>' + categ.title + '</h4>' +
                        '</a></li>');
                });

        $('#recipeList').listview('refresh');
    };

    var displayRecipe = function(data) {
        var decoded = $('<textarea/>').html(data[0].title).val();

        $('#recipeTitle').text(decoded);
        $('#recipeDetail').html(data[0].content);
        $('#recipeDetail img').each(function(i, ele) {
            $(ele).attr('width','100%');
            $(ele).attr('height','auto');
            $(ele).css('max-width',640);
        });
        $('#recipeDetail a').each(function(i, ele) {
            $(ele).removeAttr('href');
        });
    };

    var favoriteList = function(){

        console.error("persiana");
        $.mobile.changePage( "#favoriteListPage", { transition: "slidedown"} );
    };

    var paintFavoriteList = function(){

        $('#favoriteList li').remove();
      
        $.each($.jStorage.get('orderedList').posts, function(index,categ) {
            if ($.inArray(categ.ID.toString(),$.jStorage.get('favorites'),0) > 0){

                   $('#favoriteList').append('<li><a data-param="favorites" data-recipeID="' + categ.ID + '" href="#detailsPage">' +
                        '<img src="' + categ.featured_image + '"></img>' +
                        '<h4>' + categ.title + '</h4>' +
                        '</a><a href="#" id="'+categ.ID+'" onclick="Sala2.deleteFavorite(this.id);" data-rel="popup" data-position-to="window"  data-icon="delete"></li>');
            }
        });
            
        $('#favoriteList').listview('refresh');
    };

    var paintList = function(){
        $('#alphabeticalList li').remove();
        console.error("ordennn");
             
                $.each(($.jStorage.get('orderedList').posts), function(index, categ) {
                    var tit = (categ.title).substring(1,categ.title.length).replace("!","");
                   
                   $('#alphabeticalList').append('<li><a data-param="favorites" data-recipeID="' + categ.ID + '" href="#detailsPage">' +
                        '<img src="' + categ.featured_image + '"></img>' +
                        '<h4>' + tit + '</h4>' +
                        '</a></li>');
                });
                //hide loading div
                $.mobile.loading( 'hide');
                $('#alphabeticalList').listview('refresh');

    };

    var deleteFavorite = function(idRecipe){
        var favoriteList = $.jStorage.get('favorites');
        favoriteList = $.grep(favoriteList, function(value) {
            return value != idRecipe;
        });
        $.jStorage.set("favorites",favoriteList);
        $.mobile.changePage( "#favoriteListPage", { transition: "none",allowSamePageTransition : true} );
    };

    return {
        init: init,
        deleteFavorite: deleteFavorite
    };

})( jQuery, this );