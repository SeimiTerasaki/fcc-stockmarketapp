$(function () {
  var names;
  var companies;
  var ticker;
  var socket = io.connect();
  var seriesOptions = [];

    function createChart() {
   $('#chart').highcharts({
            title:{
              text:"Stock Market Prices"
            },
            rangeSelector: {
                selected: 4
            },
            xAxis: {
                   allowDecimals: false,
                   type: 'category'
                    },
            yAxis: {
               title: {
            text: 'Percentage'
        },
                labels: {
                    formatter: function () {
                        return (this.value > 0 ? ' + ' : '') + this.value + '%';
                    }
                },
                plotLines: [{
                    value: 0,
                    width: 2,
                    color: 'silver'
                }]
            },
            plotOptions: {
                series: {
                    compare: 'percent',
                    showInNavigator: true
                }
            },
            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
                valueDecimals: 2,
                split: true
            },
            series: seriesOptions
        });
    }
    $.each(names, function (i, name) {
        $.getJSON('https://www.quandl.com/api/v3/datasets/WIKI/'+name+'.json?column_index=4&start_date=2016-01-01&end_date=2017-01-01&collapse=monthly&transform=diff&api_key=H-4sfw8LEnTedof2KP-9',function (data) {
            seriesOptions[i] = {
                name: name,
                data: data.dataset.data
            };
          seriesCounter += 1;
            if (seriesCounter === names.length) {
                createChart();
            }
         });
       });

    function setSeries(){
    $.each(names, function (i, name) {
        
        $.getJSON('https://www.quandl.com/api/v3/datasets/WIKI/'+name+'.json?column_index=4&start_date=2014-01-01&end_date=2014-12-31&collapse=monthly&transform=rdiff&api_key=H-4sfw8LEnTedof2KP-9',function (data){ 
            seriesOptions[i] = {
                name: name,
                data: data.dataset.data
            };
                createChart();
        });
    });
     console.log(seriesOptions);
  }
  
  function addDivs(){
     for(var i =0; i<names.length; i++){
     $("#stockNames").prepend('<div class="col-sm-4">'+'<div class="panel panel-success" id="stockDiv">'+'<button type="button" class="close" data-dismiss="modal" name='+names[i]+'>&times;</button>'+'<div class="panel-heading">'+names[i]+'</div>'+'<div class="panel-body">'+companies[i]+'</div>'+'</div></div>');
     }
    }

    function updateDivs(newTicker){
     $("#stockNames").prepend('<div class="col-sm-4">'+'<div class="panel panel-success" id="stockDiv">'+'<button type="button" class="close" data-dismiss="modal" name='+newTicker.symbol+'>&times;</button>'+'<div class="panel-heading">'+newTicker.symbol+'</div>'+'<div class="panel-body">'+newTicker.name+'</div>'+'</div></div>');
    }
  
  socket.on('output', function(data){
     names = data.map(function(x) { return x.symbol });
     companies = data.map(function(x) { return x.name });
     setSeries();
     addDivs();
  });
  
  socket.on('isValid', function(response){
        $('#formInput').val(" ");
        names.push(ticker);
        seriesOptions = [];
        console.log("new ticker"+response);
        setSeries();
        updateDivs(response);
  });
  
  socket.on('notValid', function(response){
      $('#formInput').val("Sorry no symbol found");
  });

  $('#formBtn').on('click', function(e){
    e.preventDefault();
     ticker = $('#formInput').val();
     ticker = ticker.replace(/\s+/g, '').toUpperCase();
     socket.emit('check', ticker);
  });
    
    $('#stockNames').on('click','.close',function(){
    var div = $(this).prop('name');
    var index = names.indexOf(div);
    names.splice(index, 1);
      $(this).closest('.col-sm-4').remove();
       socket.emit('remove', div);
     
    });

});