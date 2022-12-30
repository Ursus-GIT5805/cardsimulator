function toggleHand(){
	let ele = document.getElementById("handcontainer");
	if(ele == null) return;
	
	if( ele.style.display == "block" ) ele.style.display = "none";
	else ele.style.display = "block";
}

document.getElementById("hand").ondrop = function(e){
	e.preventDefault();
	e.stopPropagation();

	let cardID = parseID( e.dataTransfer.getData("dragID") );
	if( e.dataTransfer.getData("dragID") == "selcards" ){
		let ele = document.getElementById("selcards");

		while(ele.children.length > 0){
			let id = parseID( ele.children[0].id );

			send({
				'type': 'REMOVE',
				'id': id
			});

			ele.removeChild( ele.children[0] );
			if( cards[id].facedown ){
				let bef = cCard;
				cCard = id;
				toggleFacedown();
				cCard = bef;
			}
			createDisplayCard( id, "handcontainer" );
		}
		return;
	}
	if( cardID < 0 ) return;

	send({
		'type': 'REMOVE',
		'id': cardID
	});

	let cs = getStackCards( e.dataTransfer.getData("dragID") );
	removeCard( cs[0] );
	for(let i = 0 ; i < cs.length ; ++i){
		let id = cs[i];
		if( cards[id].facedown ){
			let bef = cCard;
			cCard = id;
			toggleFacedown();
			cCard = bef;
		}

		createDisplayCard( id, "handcontainer" );
	}
}

document.getElementById("hand").ondragover = allowDrop;
