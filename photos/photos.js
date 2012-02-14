/*jshint jquery: true, browser: true, white: true */
/*global Spinner: false */

var flickrapikey = 'a0b5ea78ea70732fdc70fed68511159a';

var albumSet = {
    favs: "72157626659463147",
    macro: "72157623777879031",
    portraits: ""
};
var setList = {};
var fullsizeImage = {};

jQuery.support.cors = true;


function positionImage(xrat, yrat) {
    var $cont = $("#main-photo");
    var $doc = $(document);
    var imageRatio = $cont.data("image-ratio");
    var pageRatio = $doc.height() / $doc.width();
    if (pageRatio > imageRatio) {
        $cont.css("background-position-x",
            -xrat * (($doc.height() / imageRatio) - $doc.width()) + "px");
        $cont.css("background-position-y", 0);
    } else {
        $cont.css("background-position-y",
            -yrat * ($doc.width() * imageRatio - $doc.height()) + "px");
        $cont.css("background-position-x", 0);
    }
}

function albumUrl(albumid) {
    return "http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=" +
    flickrapikey +
    "&photoset_id=" +
    albumid +
    "&extras=url_t%2C+url_l&format=json&jsoncallback=?";
}

function loadImage($thumb) {
    var imageid = $thumb.attr("id");
    var image;
    var $overlay = $('#overlay');
    
    $("#loading-image-holder img").detach();

    if (fullsizeImage[imageid]) {
        image = fullsizeImage[imageid];
        displayImage(image);
    } else {
        $overlay.fadeIn(300);
        image = new Image();
        $(image).load(function () {
            displayImage(image);
            positionImage();
            $overlay.fadeOut(600);
        });
        image.src = $thumb.data("fullsize");
        fullsizeImage[imageid] = image;
    }
    
    
}

function displayImage(image) {
    $("#main-photo").css("background-image", "url(" + image.src + ")");
    $("#main-photo").data("image-ratio", image.height / image.width);
}

function loadAlbum(albumid, firstimage, ihash) {
    $("#thumb-cont a").detach();
    if (setList[albumid]) {
        $("#thumb-cont").append(setList[albumid]);
        loadImage($("#thumb-cont a").first());
        $("#thumb-cont").css("left", 0);
    } else {
        $.getJSON(albumUrl(albumid), function (data) {
            var imageData, image, hash;
            hash = ihash || window.location.hash;
            for (var i = 0; i < data.photoset.photo.length; i++) {
                imageData = data.photoset.photo[i];
                image = new Image();
                image.src = imageData.url_t;

                $("#thumb-cont")
                .append(
                    setList[albumid] = $("<a></a>")
                    .attr({id: imageData.id, href: hash  + "." + imageData.id})
                    .data("fullsize", imageData.url_l)
                    .append(image)
                );
            }
            setList[albumid] = $("#thumb-cont a");

            if (firstimage) {
                $("#" + firstimage).trigger('click');

            } else {
                loadImage($("#thumb-cont a").first());
                $("#thumb-cont").css("left", 0);

            }
        })
        .error(function (e) { console.log('error', e); });
    }
}




$(document).ready(function () {
    $(".album").bind("click", function () {
        loadAlbum(albumSet[this.id]);
        $("#thumb-scroller").css('opacity', 1);
    });

    $("#thumb-cont").delegate("a", "click", function () {
        loadImage($(this));
    });

    $(document).bind("mousemove", function (e) {
        var $doc = $(document);
        positionImage(e.pageX / $doc.width(),
                       e.pageY / $doc.height());
    });

    
    var hash = window.location.hash;
    hash = hash.split('.');

    var initalbum = albumSet[hash[0].replace("#", "")] || "72157626659463147";
    var initpic = hash[1];

    loadAlbum(initalbum, initpic, hash[0] || "#favs");
    $(".ts-container").thumbSlider();

    var spinnerOptions = {
        lines: 12, // The number of lines to draw
        length: 18, // The length of each line
        width: 6, // The line thickness
        radius: 24, // The radius of the inner circle
        color: '#fff', // #rbg or #rrggbb
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: true // Whether to render a shadow
    };

    var spinner = new Spinner(spinnerOptions).spin($('#overlay')[0]);
    $(spinner.el).css('top', '50%').css('left', '50%');

    $('#thumb-scroller').bind("mouseenter", function (e) {
        //$("#thumb-cont").css('bottom', 0);
        $("#thumb-scroller").css('opacity', 1);
    });
    $('#thumb-scroller').bind("mouseleave", function (e) {
        //$("#thumb-cont").css('bottom', -160);
        $("#thumb-scroller").css('opacity', 0);
    });

});
