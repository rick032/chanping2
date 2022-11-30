$(document).ready(function() {
	var eventDialog = $("#eventdialog");
	var isDayView = false;
	var cal = $('#calendar').fullCalendar({
		windowResize : function(view) {
			ww = $(window).width();
			var currentView = $('#calendar').fullCalendar('getView');
			if (view != currentView) {
				$('#calendar').fullCalendar('changeView', view);
			}
			if (ww <= 768) {
				$('.fc-header-right,.fc-button').hide();
			} else {
				$('.fc-header-right,.fc-button').show();
			}
		},
		header : {
			left : 'prev,next today',
			center : 'title',
			right : 'month,basicWeek,basicDay'
		},
		editable : false,
		weekMode : 'variable',
		lazyFetching : false,
		viewRender : function(view, element) {
			isDayView = view.name == 'basicDay';
			$('.fc-sat, .fc-sun').addClass('text-danger');
		},
		events : function(start, end, timezone, callback) {
			$.ajax({
				url : contextRoot + "/main/getSitemEvents",
				dataType : 'json',
				data : {
					start : start.format('YYYY-MM-DD'),
					end : end.format('YYYY-MM-DD')
				},
				success : function(doc) {
					var events = [];
					$(doc).each(function() {
						events.push({
							id : $(this).attr('id'),
							title : $(this).attr('title') + ( isDayView ? "\n" + $(this).attr('desc') : ""),
							start : new Date(Date.parse($(this).attr('start'))),
							color : 'Y' == $(this).attr('isCompleted') ? '#80ADC4' : '#3A87AD',
							allDay : true
						});
					});
					callback(events);
				}
			});
		},
		eventClick : function(event) {
			$.ajax({
				url : contextRoot + "/main/getSitemEvent",
				type : "POST",
				data : {
					'tradeno' : event.id
				},
				success : function(res) {
					eventDialog.find("#TRADENO").html(event.id);
					eventDialog.find("#title").html(event.title.substr(0, event.title.indexOf('\n') > 0 ? event.title.indexOf('\n') : event.title.length));
					eventDialog.find("#start").html(event.start.format('YYYY-MM-DD'));
					var tbody = eventDialog.find("tbody");
					var content = "";
					var i = 1;
					$(res).each(function() {
						var self = $(this);
						content += "<tr" + (i % 2 == 0 ? " class='success'>" : ">");
						content += "<td>" + self.attr('sn') + "</td>";
						content += "<td>" + self.attr('GOODNO') + "</td>";
						content += "<td>" + self.attr('GOODNAME') + "</td>";
						content += "<td>" + self.attr('TRADEQTY') + "</td>";
						content += "<td>" + self.attr('SHIPQTY') + "</td>";
						content += "</tr>";
						i++;
					});
					tbody.html(content);
					eventDialog.fancybox({
						openMethod : 'zoomIn',
						afterLoad : function() {
						}
					}).click();
					$("#pclose1").click(function() {
						$.fancybox.close();
					});
				}
			});
		}
	});
});
