/**
 * 3 APIs one 1 for getting song text, 2 for checking the sentiment of that
 * text, 3 for getting similar songs
 */
var form = $("#input_form");
form.on("submit", sub);


/*
 * submits the author and the song to API 1. Result, the song text is passed to
 * the API 2 with a request for sentiment Lastly output is appended to the html.
 * API 3 shows a list with songs with similar text @param t-- @returns --
 */
function sub() {
    var text = ""; // text to check sentiment
    event.preventDefault();
    var artist = $("#input_artist").val();
    var song = $("#input_song").val();
    console.log(artist);
    console.log(song);
    fetch("https://api.lyrics.ovh/v1/" + artist + "/" + song, {}).then(response => {
            console.log(response);
            return response.json();
        })
        .then(data => {
            console.log("text respons: ");
            text = data.lyrics;
            console.log(text);
            return text;
        }).then(text => get_sentiment(text)).then(txt => get_similar(txt))
        .catch(err => {
            window.alert("Something wrong. Song not found, sorry.");
            console.log(err);
        });

}

/**
 * Second fetch used in the first one. Needs to be wrapped in a function since
 * ECLIPSE is useless and throws syntax error when using async and wait
 * 
 * @param text -
 *            String to be submitted to sentiment API
 * @returns text - Same text as input
 */
function get_sentiment(text) {
    var text_to_send = {
        "text": text

    };
    console.log(text_to_send);

    fetch("https://sentim-api.herokuapp.com/api/v1/", {

            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(text_to_send)
        }).then(response => {
            console.log(response);
            return response.json();
        })
        .then(data => {
            console.log("sentiment respons: ");
            console.log(data);
            var polarity = data.result.polarity;
            var type = data.result.type
            $("#text_card").remove();
            $("#midlle_col").append('<div class="card" id="text_card">' +
                '<div class="card-body">' +
                '<h5 class="card-title">' + type + '</h5>' +
                '<h6 class="card-subtitle mb-2 text-muted">' + polarity + '</h6>' +
                '<p class="card-text"><PRE>' + text + '</PRE></p>' +
                '</div>' +
                '</div>');
        })
        .catch(err => {
            console.log(err);
        });
    return format_text(text);
}

// show additional songs and authors with similar text (sometimes API refuses
// connection - bad server)
function get_similar(txt) {
    var text_to_send = {
        "content": txt

    };
    fetch("https://searchly.asuarez.dev/api/v1/similarity/by_content", {
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST",
            mode: 'cors',
            body: JSON.stringify(text_to_send)
        }).then(response => {
            console.log(response);
            return response.json();
        })
        .then(data => {
            console.log("similar respons: ");
            console.log(data.response.similarity_list[0]);
            $("#list-group-item_changable").remove();
            for (var i = 0; i < data.response.similarity_list.length; i++) {
                $("#similarity_List").append('<li class="list-group-item" id="list-group-item_changable">' + data.response.similarity_list[i].artist_name + '<br>' + data.response.similarity_list[i].song_name + '</li>');
            }
        })
        .catch(err => {
            console.log(err);
        });
}


/**
 * Cleans txt from \n
 * 
 * @param txt -
 *            String to be cleaned
 * @returns String - clean String
 */
function format_text(txt) {
    return txt.replace(/\n/g, "");
}