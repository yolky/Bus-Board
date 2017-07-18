window.onload = getStopData;

setInterval(getStopData, 30000);

setInterval(changeColor, 250);

var xhttp = new XMLHttpRequest();

function getStopData(){
    var postCode = document.getElementById('postCodeForm').elements[0].value;
    xhttp.open("GET", "http://localhost:3000/closestStops?postCode="+postCode, false);

    xhttp.send();

    
    if(xhttp.status==200){
        var response = JSON.parse(xhttp.responseText);
        showResults(response)
    }
    else if(xhttp.status==400 || xhttp.status== 404){
        window.alert("Please enter valid London postcode");
        showResults([{busStop:"--",incomingBuses: []},{busStop: "--",incomingBuses:[]}])
    }    
}

function showResults(listOfArrivalSets){
    document.getElementById('title0').innerHTML = listOfArrivalSets[0].busStop.stationName;
    document.getElementById('title1').innerHTML = listOfArrivalSets[1].busStop.stationName;
    table0 = document.getElementById('table0');
    var tableToModify = table0;
    for(var i =1; i<tableToModify.rows.length; i++){
        if(!listOfArrivalSets[0].incomingBuses[i-1]){
            tableToModify.rows[i].cells[0].innerHTML = '--';
            tableToModify.rows[i].cells[1].innerHTML = '--';
            tableToModify.rows[i].cells[2].innerHTML = '--';
        }else{
            tableToModify.rows[i].cells[0].innerHTML = listOfArrivalSets[0].incomingBuses[i-1].destinationName;
            tableToModify.rows[i].cells[1].innerHTML = listOfArrivalSets[0].incomingBuses[i-1].lineName;
            tableToModify.rows[i].cells[2].innerHTML = listOfArrivalSets[0].incomingBuses[i-1].expectedArrival;
        }
    }

    table1 = document.getElementById('table1');
    var tableToModify = table1;
    for(var i =1; i<tableToModify.rows.length; i++){
        if(!listOfArrivalSets[0].incomingBuses[i-1]){
            tableToModify.rows[i].cells[0].innerHTML = '--';
            tableToModify.rows[i].cells[1].innerHTML = '--';
            tableToModify.rows[i].cells[2].innerHTML = '--';
        }else{
            tableToModify.rows[i].cells[0].innerHTML = listOfArrivalSets[1].incomingBuses[i-1].destinationName;
            tableToModify.rows[i].cells[1].innerHTML = listOfArrivalSets[1].incomingBuses[i-1].lineName;
            tableToModify.rows[i].cells[2].innerHTML = listOfArrivalSets[1].incomingBuses[i-1].expectedArrival;
        }
    }
}

function changeColor() {
    var red = (Math.floor(Math.random()*255)).toString();
    var green = (Math.floor(Math.random()*255)).toString();
    var blue = (Math.floor(Math.random()*255)).toString();   
    document.getElementById("postCodeForm").style.color = `rgb(${red},${green},${blue})`
    var fontSize = (Math.floor(15+(Math.random()*30))).toString()+"px";
    document.getElementById("postCodeForm").style.fontSize = fontSize;
}

function onKeyPress(event) {
    if (event.keyCode == 13) {
        getStopData();
    }
}