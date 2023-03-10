function displayBox( ele_id, e ){
	let ele = document.getElementById( ele_id );
	if(ele == null) return;
	
	let box = document.getElementById("contextMenu");
	box.innerHTML = ele.innerHTML;
	
	let x = e.pageX;
	let y = e.pageY;
	let w = document.documentElement.clientWidth;
	let h = document.documentElement.clientHeight;
	
	box.style.display = "block";

	let bw = box.getBoundingClientRect().right - box.getBoundingClientRect().left;
	let bh = box.getBoundingClientRect().bottom - box.getBoundingClientRect().top;

	x = Math.min( x, w - bw );
	y = Math.min( y, h - bh );

	box.style.left = x + "px";
	box.style.top = y + "px";
}

// Pile ---

var cPile = -1;

function draw(){
	if( cPile == -1 ) return;
	if( piles[cPile].cards.length == 0 ) return;

	let c = piles[ cPile ].take();
	
	displayActiontip("pile" + cPile, "Draw");
	createDisplayCard( c, "handcontainer" );
	closeBrowser();
	
	send({
		'type': 'TAKEPILE',
		'pile': cPile
	});

	let ele = document.getElementById("handcontainer");
	if( ele.style.display != "block" ) toggleHand();

	cards[ c ].facedown = true;
	cCard = c;
	toggleFacedown();
	cCard = -1;

	ele.scrollLeft = ele.scrollWidth;
}

function search(){
	if( cPile == -1 ) return;
	
	displayActiontip("pile" + cPile, "Search");
	openPile( cPile );
}

function shuffle(){
	if( cPile == -1 ) return;

	displayActiontip("pile" + cPile, "Shuffle");

    piles[cPile].cards = shuffleArray( piles[cPile].cards );
    if(openP == cPile) openPile(openP);

    piles[ cPile ].updateIMG();
	piles[ cPile ].setAnimation( "PileShuffle" );

	send({
		'type': 'SHUFFLE',
		'pile': cPile,
		'order': piles[ cPile ].cards
	});
}

function playCard( fromTop=true ){
	if( cPile == -1 ) return;

	displayActiontip("pile" + cPile, "Play " + ["bottom", "top"][+fromTop]);

	let top = piles[ cPile ].take( fromTop );
	createCard( top, "table" );

	send({
		'type': 'PLAY',
		'id': top,
		'pile': cPile
	});
}

function togglePileFace( doSend=true ){
	if( cPile == -1 ) return;

	piles[ cPile ].facedown = !piles[ cPile ].facedown;
	for(let i = 0 ; i < piles[cPile].cards.length ; ++i){
		cards[ piles[cPile].cards[i] ].facedown = piles[cPile].facedown;
	}
	piles[ cPile ].updateIMG();
    if(openP == cPile) openPile(openP); // update cards in browser

	if( !doSend ) return;

	send({
		'type': 'PILEFACE',
		'id': cPile,
		'facedown': piles[cPile].facedown
	});
}

// Card ---

var cCard = -1;

function rotate( degress, doSend=true ){
	if( cCard == -1 ) return;

	let deg = 0;
	let ele = document.getElementById("c" + cCard);
	if( ele == null ) ele = document.getElementById("c" + cCard + "img");
	if( ele == null ) return;

	let t = ele.style.transform;
	if(t != "") deg = parseInt( t.substring(7, t.indexOf("deg")) );

	deg = (deg+(degress % 360)+360) % 360;
	ele.style.transform = "rotate(" + deg + "deg)";

	if(doSend){
		send({
			'type': "ROTATE",
			'id': cCard,
			'deg': deg
		});
	}
}

function toggleFacedown( doSend=true ){
	if( cCard == -1 ) return;

	if(doSend){
		send({
			'type': "SETFACE",
			'id': cCard,
			'facedown': !cards[cCard].facedown
		});
	}
	cards[ cCard ].facedown = !cards[ cCard ].facedown;
	if( cardsPile[ cCard ] != -1 ) piles[ cardsPile[cCard] ].updateIMG();
	cards[cCard].peek = false;

	let img = document.getElementById("c" + cCard + "img");
	if( img == null ) return;
	
	img.src = cards[ cCard ].getIMG();

	ele = document.getElementById("c" + cCard);
	if(ele != null) ele.style.filter = "";
}

function togglePeek( doSend=true ){
	if( cCard == -1 ) return;
	if( !cards[cCard].facedown ) return;

	cards[cCard].peek = !cards[cCard].peek;
	let ele = document.getElementById("c" + cCard + "img");
	ele.src = cards[cCard].getIMG();

	ele = document.getElementById("c" + cCard);
	if(ele != null){
		if(ele.style.filter == "invert(80%)"){
			cards[cCard].peek = false;
			cards[cCard].facedown = true;
			toggleFacedown( false );
		}

		ele.style.filter = ["", "blur(1px)"][ +(cards[cCard].peek) ];
	}

	if(doSend){
		send({
			'type': 'PEEKAT',
			'id': cCard,
			'peek': cards[cCard].peek
		});
	}
}

// Prioritybuttons ---

var cPButton = -1;
function removePriorityButton( doSend=true ){
	let ele = document.getElementById("pbutton" + cPButton);
	if(ele == null) return;
	ele.parentNode.removeChild(ele);

	if(!doSend) return;

	send({
		'type': 'REMPRIORITYBUTTON',
		'id': cPButton
	});
}

// Zones ---

var cZone = -1;

function removeZone( doSend=true ){
	let ele = document.getElementById("zones" + cZone);
	if(ele == null) return;
	ele.parentNode.removeChild(ele);

	if(!doSend) return;

	send({
		'type': 'REMZONE',
		'id': cZone
	});
}

// ---

// Shuffles selected cards
function selShuffle(){
	let sel = document.getElementById("selcards");
	let table = document.getElementById("table");

	let cords = [];
	for(let i = 0 ; i < sel.children.length ; ++i)
		cords.push( [sel.children[i].style.left, sel.children[i].style.top] );
	cords = shuffleArray( cords );

	for(let i = 0 ; i < sel.children.length ; ++i){
		let ele = sel.children[i];

		ele.style.left = cords[i][0];
		ele.style.top = cords[i][1];

		let ax = (ele.getBoundingClientRect().left - table.getBoundingClientRect().left);
		let ay = (ele.getBoundingClientRect().top - table.getBoundingClientRect().top);
		let x = ax * 100 / table.clientWidth;
		let y = ay * 100 / table.clientHeight;

		send({
			'type': 'MOVE',
			'left': x,
			'top': y,
			'id': ele.id,
			'parent': 'table'
		});
	}
	displayActiontip(sel.children[0].id, "Shuffled", false, true);
}

// For each cards which got selected run a function
function selForEach( fun ){
	let sel = document.getElementById("selcards");
	for(let i = 0 ; i < sel.children.length ; ++i) fun( sel.children[i] );
}

function selDoFun( fun ){
	let f = function( ele ){
		cCard = parseID( ele.id );
		fun();
	};
	selForEach(f);
}

function selRotate(deg){
	let f = function( ele ){
		cCard = parseID( ele.id );
		rotate(deg);
	};
	selForEach(f);
}
