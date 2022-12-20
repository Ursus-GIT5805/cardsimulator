function roll(){
    let m = parseInt( document.getElementById("randMin").value );
    let x = parseInt( document.getElementById("randMax").value );
    let res = Math.floor( Math.random()*(x-m+1) ) + m;
    displayRandResult( res );
    send({
       'type': 'RANDROLL',
       'result': res,
       'min': m,
       'max': x
    });
}

function displayRandResult( result ){
    let ele = document.getElementById("randResult");
    ele.parentNode.style.display = "block";
    ele.innerHTML = result;
}

function toggleRandomWindow( doSend=true ){
    document.getElementById("randResult").parentNode.style.display = "none";

    let ele = document.getElementById("randomWindow");
    if( ele.style.display != "block" ) ele.style.display = "block";
    else ele.style.display = "none";

    if( doSend ){
        send({
           'type': 'TOGGLERANDW'
        });
    }
}
