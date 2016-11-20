$(function () {
  var names;
  var companies;
  var ticker;
  var socket = io.connect();
  var seriesOptions = [];

    function createChart() {
      Highcharts.stockChart('container', {
            rangeSelector: {
                selected: 4
            },
            colors: ['#2f7ed8', '#0d233a', '#8bbc21', '#910000', '#1aadce', 
   '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a'],
            yAxis: {
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
            series: seriesOptions,
            responsive: {
              rules: [{
                condition: {
                  maxWidth: 700
                },
                chartOptions: {
                  legend: {
                    enabled: false
                  }
                }
              }]
            }
        });
    }

    function setSeries(){
        console.log(names);
    $.each(names, function (i, name) {
        $.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=' + name.toLowerCase() + '-c.json&callback=?',function (data) {
            seriesOptions[i] = {
                name: name,
                data: data
            };
                createChart();
        });
    });
     console.log(seriesOptions);
  }
  
  function addDivs(){
     for(var i =0; i<names.length; i++){
     $("#stockNames").prepend('<div class="col-sm-4">'+'<div class="panel panel-success" id="stockDiv">'+'<button type="button" class="close" data-dismiss="modal" name='+names[i]+'>&times;</button>'+'<div class="panel-heading">'+names[i]+'</div>'+'<div class="panel-body">'+companies[i]+'</div>'+'</div></div>');
     };
    }

    function updateDivs(last){
      for(var i =0; i<names.length; i++){
     $("#stockNames").prepend('<div class="col-sm-4">'+'<div class="panel panel-success" id="stockDiv">'+'<button type="button" class="close" data-dismiss="modal" name='+names[i]+'>&times;</button>'+'<div class="panel-heading">'+names[i]+'</div>'+'<div class="panel-body">'+companies[i]+'</div>'+'</div></div>');
     };
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
        console.log("ticker:"+names);
        setSeries();
        updateDivs(response.name);
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