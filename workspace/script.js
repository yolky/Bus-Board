window.onload = getStopData;

setInterval(getStopData, 30000);

var xhttp = new XMLHttpRequest();

function getStopData(){
    var postCode = document.getElementById('postCodeForm').elements[0].value;
    xhttp.open("GET", "http://localhost:3000/closestStops?postCode="+postCode, false);

    xhttp.send();

    
    if(xhttp.status==200){
        var response = JSON.parse(xhttp.responseText);
    }
    else if(xhttp.status==400 || xhttp.status== 404){
        window.open('./error.html')
    }
    
    //document.getElementById('dynamicText').innerHTML = response[0][0]['destinationName'];
    showResults(response)
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
        tableToModify.rows[i].cells[0].setAttribute('align', 'center');
        tableToModify.rows[i].cells[1].setAttribute('align', 'center');
        tableToModify.rows[i].cells[2].setAttribute('align', 'center');
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
        
        tableToModify.rows[i].cells[0].setAttribute('align', 'center');
        tableToModify.rows[i].cells[1].setAttribute('align', 'center');
        tableToModify.rows[i].cells[2].setAttribute('align', 'center');
    }
}