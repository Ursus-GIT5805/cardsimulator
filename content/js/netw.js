var playerID = -1;
var decks = [ [], [] ];
var backs = [ "", "" ];

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
    addDeck( data['deck'], data['side'], data['back'], data['id'] );

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
    document.getElementById("enemyInfo").style.animationName = "CardNumChange";
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

// ---

var peer = null;
var conn = null;

function sendDeck( id ){
    let doc = document.getElementById("deckinput").files[0];
    if(doc == null) return;

    let reader = new FileReader();
    reader.readAsText(doc);

    const ID = id;

    reader.onload = function(e){
        let s = JSON.parse( e.target.result );
        addDeck( s['deck'], s['side'], s['back'], ID );
        send({
           'type': 'DECK',
           'deck': s['deck'],
           'side': s['side'],
           'back': s['back'],
           'id': ID
        });
    }
}

function addDeck(deck, side, back, id){
    decks[id] = [ deck, side ];
    backs[id] = back;

    let img = new Image();
    img.onerror = function(e){
        backs[id] = "img/not_found.svg";
        for(let i = 0 ; i < piles.length ; ++i) piles[i].updateIMG();
    }
    img.src = back;

    if( decks[0].length > 0 && decks[1].length > 0 ) createDecks();
}

function createDecks(){
    let decksizes = [];

    for(let d = 0 ; d < decks.length ; ++d){
        decksizes.push([0, 0]);

        for(let j = 0 ; j < 2 ; ++j){
            for(let key in decks[d][j]){
                for(let i = 0 ; i < decks[d][j][key] ; ++i) cards.push( new Card(key, d) );
                decksizes[d][j] += decks[d][j][key];
            }
        }
    }

    let p = 0;
    for(let i = 0 ; i < decks.length ; ++i){
        piles.push( new Pile( true ) );
        document.getElementById("pile" + (2*i)).style.left = (50/decks.length/2)*(2*i) + "%";
        for(let j = 0 ; j < decksizes[i][0]; ++j){
            cardsPile.push( piles.length-1 );
            piles[ piles.length-1 ].push( p++ );
        }

        piles.push( new Pile() );
        document.getElementById("pile" + (2*i+1)).style.left = (50/decks.length/2)*(2*i+1) + "%";
        for(let j = 0 ; j < decksizes[i][1] ; ++j){
            cardsPile.push( piles.length-1 );
            piles[ piles.length-1 ].push( p++ );
        }
    }
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
        playerID = 1;

        console.log("Connected to other player!")
        sendDeck( 1 );
        setEvents();
        removePins();
        document.getElementById("enemyInfo").style.display = "block";
        document.getElementById("Utility").style.display = "block";
    });
}

function initPeer(){
    peer = new Peer( null );

    peer.on('open', function(id){
        console.log("Peer open...");
        playerID = 0;
    });

    peer.on('connection', function(c){
        if(conn != null) return;

        removePins();
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
