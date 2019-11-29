$(function(){
	'use strict'
	
	const markerArray = [];
	const addressArray = [];

	const addMarker = document.getElementById('add-marker');

	$(addMarker).prop('disabled', true);
	var counter = 1;
	var markerCounter=0;

	// add marker
	$(addMarker).on('click', function(){

		if(counter == 15){
			alert("You've reached the max number of inputs )");
			$(addMarker).prop('disabled', true);
			return
		}
		
		addField();

		$(addMarker).prop('disabled', true);
		counter += 1;
	})
	// end add marker

	// add input and row
	function addField(){

		const newInput = '<div class="map-group row input-group'+ addressArray.length +'">'+
			'<div class="col-sm-6">'+
				'<div class="form-group">'+
					'<input type="hidden" name="address'+ addressArray.length +'" id="marker'+ addressArray.length +'" class="form-control" readonly placeholder="Marker location">'+
				'</div>'+
			'</div>'+			
			'<div class="col-sm-6">'+
				'<div class="form-group">'+
					'<input type="hidden" name="coordinate'+ addressArray.length +'" id="coordinate'+ addressArray.length +'" class="form-control" readonly placeholder="Marker coordinates">'+
				'</div>'+
			'</div>'+
		'</div>'
		$('.map-group-wrapper').append(newInput);

		const newRow = '<tr class="table-row table-remove'+ addressArray.length +'">'+
				      '<th scope="row">'+ (addressArray.length+1) +'</th>'+
				      '<td class="table-address'+ addressArray.length +'"></td>'+
				      '<td class="table-coordinate'+ addressArray.length +'"></td>'+
				    '</tr>'
		$('.table-body').append(newRow);
	}

	addField();

	
	window.onload = function() {
		
		var geocoder = new google.maps.Geocoder();
		var latlng = new google.maps.LatLng(37.090240, -95.712891);
    var map = new google.maps.Map(document.getElementById('map'), {
        center: latlng,
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    // getting local address
     if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(function (position) {
             const initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
             map.setCenter(initialLocation);
         });
     }
    // end getting local address

     // etting a marker function
		function setCoordinate(a){			
			
			geocoder.geocode( { 'location': a.latLng }, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					markerCounter += 1;
					var placemark = 'placemark'+counter;
					
					const coordinates = a.latLng.lat().toFixed(5) + ',' + a.latLng.lng().toFixed(5);
					const formattedAddress = results[0].formatted_address

					placemark = new google.maps.Marker({
						id: counter,
						position: a.latLng,
						map: map,
						title: formattedAddress,
						draggable: true,
						zIndex: counter
					});

					

					const content = '<div>'+
						'<span>'+ formattedAddress +'</span></br></br>'+
						'<button class="btn btn-sm btn-primary" onclick="deleteMarker('+placemark.id+')">Remove</button>'+
						'</div>';
					const infowindow = new google.maps.InfoWindow({
	          content: content
	        });

	        placemark.addListener('click', function(){

	        	infowindow.open(map, placemark);
	        });
					
					addressArray.push({
						id: counter,
						coordinate: coordinates,
						address: formattedAddress
					});
					
					setAddress();

					markerArray.push(placemark);				
					
					markerArray.forEach(function(item, index){

						google.maps.event.addListener(item, 'dragend', function(e) {
							setDragging(e, index);
						});

					})
					$(addMarker).prop('disabled', false);
					
				} else {
					alert('*An incorrect place selected. Please, select a right place.');
					$(addMarker).prop('disabled', true);
				}
			});
		};
		// end setting a marker function
		
		// dragging marker function
		function setDragging(e, index){
			geocoder.geocode( { 'location': e.latLng }, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					const coordinates1 = e.latLng.lat().toFixed(5) + ',' + e.latLng.lng().toFixed(5);
					const formattedAddress1 = results[0].formatted_address;
					addressArray[index].coordinate = coordinates1;
					addressArray[index].address = formattedAddress1;
					setAddress();
				}else{
					console.log('*An incorrect place selected. Please, select a right place.');
				}
			});
		}
		// end dragging marker
  	
  	// adding a marker event
		google.maps.event.addListener(map, 'click', function(a) {
			if(counter - 1 == markerCounter){
				setCoordinate(a, 'click');
			}else{
				alert('Please, click the Add marker button')
			}
		});
		// end adding a marker event

		// form submission event
		$('.google-form').submit('click', function(e){
			if(!$('#marker'+(counter-1)).val()){
				e.preventDefault();
				alert('Please, fill the input ' + counter);
			}
		})
		// end form submission event

		// setting address
		window.setAddress = function (){
			$('.map-group-wrapper').text('');
			$('.table-body').text('');

			addressArray.forEach(function(item, index){
				const newInput = '<div class="map-group row input-group'+ index +'">'+
					'<div class="col-sm-6">'+
						'<div class="form-group">'+
							'<input type="hidden" value="' + item.address + '" name="address'+ index +'" id="marker'+ index +'" class="form-control" readonly placeholder="Marker location">'+
						'</div>'+
					'</div>'+			
					'<div class="col-sm-6">'+
						'<div class="form-group">'+
							'<input type="hidden" value="' + item.coordinate + '" name="coordinate'+ index +'" id="coordinate'+ index +'" class="form-control" readonly placeholder="Marker coordinates">'+
						'</div>'+
					'</div>'+
				'</div>';

				const newRow = '<tr class="table-row table-remove'+ index +'">'+
						      '<th scope="row">'+ (index+1) +'</th>'+
						      '<td class="table-address'+ index +'">' + item.address + '</td>'+
						      '<td class="table-coordinate'+ index +'">' + item.coordinate + '<button onclick="deleteMarker('+ item.id +')" class="remove-button ml-3 float-right btn btn-sm btn-light"><img width="15" src="./images/cancel.svg"/></button></td>'+
						    '</tr>';

				$('.map-group-wrapper').append(newInput);
				$('.table-body').append(newRow);
			});

		}
		// end setting address

		// deleting a marker function
		window.deleteMarker = function (id){
			for (var i = 0; i < markerArray.length; i++) {
	      if (markerArray[i].id == id) {                 
	        markerArray[i].setMap(null);
	        markerArray.splice(i, 1);
	        addressArray.splice(i,1);
	        setAddress();
	        return
	      }
	    }
		}
		// end deleting a marker function


	};
})