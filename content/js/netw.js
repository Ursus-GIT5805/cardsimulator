var decks = 0; // number of decks
var decksizes = [];
var backs = [];

function fMOVE(data){
    let ele = document.getElementById( data['id'] );
    if(ele == null) return;
    let par = document.getElementById( data['parent'] );

    if( par.id == "table" ){
        ele.style.right = (data['left']) + "%";
        ele.style.bottom = (data['top']) + "%";
        ele.style.top = "auto";
        ele.style.left = "auto";
    } else {
        ele.style.left = (data['left']) + "%";
        ele.style.top = (data['top']) + "%";
        ele.style.bottom = "auto";
        ele.style.right = "aucat /proc/bus/input/devicesto";
    }

    if( ele != null && ele.parentNode.id != par.id ){
		ele.style.width = (ele.clientWidth*100 / par.clientWidth) + "%";
		ele.style.height = (ele.clientHeight*100 / par.clientHeight) + "%";
        par.appendChild( ele );
    }
}

function fRESIZE(data){
    let ele = document.getElementById( data['id'] );
    if(ele == null) return;

    if(ele.parentNode.id == "selcards") mergeToTable( ele.id );

    ele.style.height = data['height'];
    ele.style.width = data['width'];
}

function fCOUNTER(data){
    createCounter( "table", data['content'], doSend=false );
}

function fREMCOUNTER(data){
    let ele = document.getElementById(data['id']);
    if( ele == null ) return;

    ele.parentNode.removeChild(ele);
}

function fCOUNTERCONTENT(data){
    document.getElementById( data['id'] ).value = data['value'];
}

function fPILE(data){
    createPile( "table", false );
}

function fDECK( data ){
    addDeck( data['deck'], data['side'], data['back'] );

    if( data['id'] == 1 ) sendDeck(0);
}

function fINPILE( data ){
    let pile = data['pile'];
    let cs = getStackCards( data['id'] );
    for(let i = 0 ; i < cs.length ; ++i) piles[pile].push( cs[i], data['top'] );

    removeCard( cs[0] );
}

function fPLAY( data ){
    if( data['pile'] != -1 ) piles[ data['pile'] ].erase( data['id'] );
    createCard( data['id'], 'table' );
}

function fSHUFFLE( data ){
    piles[ data['pile'] ].cards = data['order'];
    if(openP == data['pile']) openPile(data['pile']);
    piles[ data['pile'] ].updateIMG();
    piles[ data['pile'] ].setAnimation( "PileShuffle" );
}

function fTAKEPILE( data ){
    piles[ data['pile'] ].take();

}

function fREMOVE( data ){
    removeCard( data['id'] );
}

function fSETFACE( data ){
    cCard = data['id'];
    cards[ cCard ].facedown = !data['facedown'];
    cards[cCard].peek = false;
    toggleFacedown( false );
}

function fPEEKAT( data ){
    cCard = data['id'];

    let ele = document.getElementById("c" + cCard);
    if(ele == null) return;

    if( cards[cCard].peek ){
        cards[cCard].peek = false;
        cards[cCard].facedown = true;
        toggleFacedown( false );
        ele.style.filter = "";
        return;
    }
    ele.style.filter = ["", "invert(80%)"][ +(data['peek']) ];
}

function fROTATE( data ){
	let ele = document.getElementById("c" + data['id']);
	if( ele == null ) ele = document.getElementById("c" + data['id'] + "img");
	if( ele == null ) return;

    ele.style.transform = "rotate(" + data['deg'] + "deg)";
}

function fTOGGLERANDW( data ){
    toggleRandomWindow( doSend=false );
}

function fRANDROLL( data ){
    displayRandResult( data['result'] );
    document.getElementById("randMax").value = data['max'];
    document.getElementById("randMin").value = data['min'];
}

function fPIN( data ){
    if(data['container'] == "table"){
        data['x'] = 100 - data['x'];
        data['y'] = 100 - data['y'];
    }
    createPin( data['container'], data['x'], data['y'], false );
}

function fREMPINS( data ){
    removePins( doSend=false );
}

function fHANDSIZE( data ){
    document.getElementById("Ecardnum").innerHTML = data['size'];
    document.getElementById("enemyInfo").style.animationName = "";
    setTimeout(function(){
        document.getElementById("enemyInfo").style.animationName = "CardNumChange";
    },0);
}

function fOPENPILE( data ){
    let ele = document.getElementById("pile" + data['id']);
    if( ele == null ) return;

    ele.style.animationName = ["PileSearch", "none"][ +data['close'] ];
}

function fPILEFACE( data ){
    let bef = cPile;
    cPile = data['id'];
    piles[ cPile ].facedown = !data['facedown'];
    togglePileFace(false);
    cPile = bef;
}

function fZONE( data ){
    createZone("table", false);
}

function fZONECOLOR( data ){
    let ele = document.getElementById("zones" + data['id']);
    if(ele != null) ele.style.backgroundColor = data['color'];
}

function fREMZONE( data ){
    cZone = data['id'];
    removeZone( false );
    cZone = -1;
}

function fCHATMSG( data ){
    addMSG( data['msg'], "#FFFFFF" );
    openChat(true);
}

function fPRIORITYBUTTON( data ){
    createPriorityButton( "table", false, false );
}

function fBUTTONPURPOSE( data ){
    if(data['id'].indexOf("priopurpose") != 0) return;
    document.getElementById(data['id']).value = data['content'];
}

function fTOGGLEPRIORITY( data ){
    togglePrio( data['id'], false );
}

function fREMPRIORITYBUTTON( data ){
    cPButton = data['id'];
    removePriorityButton(false);
}

function fACTIONTIP( data ){
    displayActiontip(data['ele_id'], data['info'], true);
}

function fHOVER( data ){
    let ele = document.getElementById("enemyHover");
    if(ele == null){
        ele = document.createElement('div');
        ele.id = "enemyHover";
    }
    ele.style.display = "block";
    document.getElementById(data['ele']).appendChild(ele);
}

function fUNHOVER( data ){
    let ele = document.getElementById("enemyHover");
    if(ele == null) return;
    ele.style.display = "none";
}

// Offering ---

let curOffer = "";
function fOFFER( data ){
    document.getElementById("offerWait").style.display = "none";

    let name = data['name'];

    if(name == 'ACCEPT') accept( curOffer, false );
    else if(name == 'DECLINE') curOffer = "";
    else {
        let action = "";

        if(name == "RESET") action = "reset the board"

        const response = confirm("Your opponent offers to " + action + ". Accept?");
        if(response) accept( name );
        else {
            send({
                'type': 'OFFER',
                'name': 'DECLINE'
            });
        }
    }
}

function accept( name, doSend=true ){
    if(doSend){
        send({
            'type': 'OFFER',
            'name': 'ACCEPT'
        });
    }

    if(name == 'RESET') reset();
    curOffer = "";
}

function offer( name ){
    curOffer = name;
    send({
       'type': 'OFFER',
       'name': name
    });

    document.getElementById("offerWait").style.display = "block";
}


// ---

var peer = null;
var conn = null;

function sendDeck(){
    let doc = document.getElementById("deckinput").files[0];
    if(doc == null) return;

    let reader = new FileReader();
    reader.readAsText(doc);

    reader.onload = function(e){
        let s = JSON.parse( e.target.result );
        addDeck( s['deck'], s['side'], s['back'], true );
        send({
           'type': 'DECK',
           'deck': s['deck'],
           'side': s['side'],
           'back': s['back']
        });
    }
}

function addDeck(deck, side, back, ownDeck=false ){
    backs.push( back );

    let img = new Image();
    img.onerror = function(e){
        backs[ backs.length-1 ] = "img/not_found.svg";
        for(let i = 0 ; i < piles.length ; ++i) piles[i].updateIMG();
    }
    img.src = back;

    if( decks == 0 ) reset();

    let p = cards.length;
    for(let j = 0 ; j < 2 ; ++j){
        let clist = deck;
        if(j == 1) clist = side;

        piles.push( new Pile( j == 0 ) );
        if(ownDeck) document.getElementById("pile" + (piles.length-1)).style.top = "50%";
        document.getElementById("pile" + (piles.length-1)).style.left = "0";

        let size = 0;
        for(let key in clist){
            for(let i = 0 ; i < clist[key] ; ++i){
                cards.push( new Card(key, decks) );
                cardsPile.push( piles.length-1 );
                piles[ piles.length-1 ].push( p++ );
            }
            size += clist[key];
        }
        decksizes.push( size );
    }

    if(decks++ == 0 && !ownDeck) sendDeck();
}

function startConnection(){
    if( document.getElementById("deckinput").files[0] == null ){
        document.getElementById("deckWarning").style.display = "block";
        return;
    }
    connect();
    document.getElementById("startWindow").style.display = "none";
}

function displayID(){
    if( document.getElementById("deckinput").files[0] == null ){
        document.getElementById("deckWarning").style.display = "block";
        return;
    }

    document.getElementById("peerID").style.display = "none";
    document.getElementById("startButtons").style.display = "none";
    document.getElementById("contID").style.display = "block";
    document.getElementById("yourID").innerHTML = compressPeerID(peer.id);
    console.log(peer.id);
}

// Connect to other player's ID
function connect(){
    let id = encodePeerID(document.getElementById("peerID").value);
    console.log(id);
    if( id == "" ) return;

    conn = peer.connect( id, {
        reliable: true
    });

    conn.on('open', function(){
        console.log("Connected to other player!")
        sendDeck();
        setEvents();
        document.getElementById("enemyInfo").style.display = "block";
        document.getElementById("Utility").style.display = "block";
    });
}

function initPeer(){
    peer = new Peer( null );

    peer.on('open', function(id){
        console.log("Peer open...");
    });

    peer.on('connection', function(c){
        if(conn != null) return;

        document.getElementById("startWindow").style.display = "none";
        document.getElementById("Utility").style.display = "block";
        document.getElementById("enemyInfo").style.display = "block";

        conn = c;
        setEvents();
        console.log("Other player connected!");
    });
}

function setEvents(){
    conn.on('data', function(data){
        let json = JSON.parse( data );
        console.log( json );
        window[ "f" + json['type'] ]( json );
    });

    conn.on('close', function(){
        alert("Your opponent has disconnected! You ought to reload this page.");
    });
}

function send(json){
    if(conn == null) return;
    conn.send( JSON.stringify( json ) );
}

initPeer();
