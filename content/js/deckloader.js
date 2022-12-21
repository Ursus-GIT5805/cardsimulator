function getCards( ele, deck ){
    if( deck[ ele.children[0].src ] == null ) deck[ ele.children[0].src ] = 0;
    deck[ ele.children[0].src ] +=  parseInt( ele.children[1].children[1].innerHTML );
    if( 2 < ele.children.length ) getCards( ele.children[2], deck );
}

function saveDeck(){
    let deck = {};
    let side = {};
    let back = document.getElementById("urlBack").value;

    let el = document.getElementById("car0");
    for( let i = 0 ; i < el.children.length ; i++ ) getCards( el.children[i], deck );

    el = document.getElementById("car1");
    for( let i = 0 ; i < el.children.length ; i++ ) getCards( el.children[i], side );

    let out = {
        'back': back,
        'deck': deck,
        'side': side
    };

    console.log(back);
    console.log(out);

    let data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(out));
    let download = document.createElement('a');
    download.setAttribute("href", data);
    download.setAttribute("download", "deck.json");
    download.click();
}

function uploadDeck( handler ){
    let inp = document.createElement('input');
    inp.type = "file";

    inp.onchange = function(e){
        let doc = inp.files[0];

        let reader = new FileReader();
        reader.readAsText(doc);

        reader.onload = function(e){
            let s = JSON.parse( e.target.result );
            handler( s['deck'], s['side'], s['back'] );
        }
    }

    inp.click();
}
