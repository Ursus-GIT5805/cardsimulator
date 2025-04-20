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
    for( let i = 0 ; i < el.children.length ; i++ ){
        let group = {};
        getCards( el.children[i], group );
        deck["group" + i] = group;
    }

    el = document.getElementById("car1");
    for( let i = 0 ; i < el.children.length ; i++ ) getCards( el.children[i], side );

    let out = {
        'back': back,
        'deck': deck,
        'side': side
    };

    console.log(out);

    let data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(out));
    let download = document.createElement('a');
    download.setAttribute("href", data);
    download.setAttribute("download", "deck.json");
    download.click();
}

function loadDeck( handler ){
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

function dissolveGroups( deck ){
    let result = {'back':deck['back'], 'deck':{}, 'side':{}};
	for( let k in deck['deck'] ){
        addGroupOrCardToDeck(k, deck['deck'][k], result['deck']);
    }
	for( let k in deck['side'] ){
        addGroupOrCardToDeck(k, deck['side'][k], result['side']);
    }
    return result;
}

function addGroupOrCardToDeck( sourceKey, sourceValue, targetDictionary ){
        if(sourceKey.startsWith("group")){
            for( let c in sourceValue ){
                if( targetDictionary[c] == null ) targetDictionary[c] = 0;
                targetDictionary[c] += sourceValue[c];
                console.log(targetDictionary);
            }
        } else {
            targetDictionary[sourceKey] = sourceValue;
        }
}
