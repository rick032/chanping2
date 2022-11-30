$(document).ready(function() {
	var url = window.location.pathname.substr(contextRoot.length, window.location.pathname.length);
	url = '/' == url ? url += "main" : url.substr(0, url.lastIndexOf('/'));
	var logs = $("#logs");
	$(".nav a").each(function(index) {
		var href = $(this).attr("href");
		if (href.indexOf(url) > -1) {
			if ($(this).parents(".dropdown-menu")) {
				$(this).parents(".dropdown-menu").parents('.dropdown').addClass('active').siblings().removeClass('active');
			} else {
				$(this).parent().addClass('active').siblings().removeClass('active');
			}

			return false;
		}
	});
	$("#downloadLog").fancybox({
		helpers : {
			title : {
				type : 'outside',
				position : 'top'
			}
		},
		title : '<span class="badge">Logs download</span>',
		afterClose : function() {
		}
	});
	$("#sure").click(function() {
		if (logs.val()) {
			API.formSubmit({
				url : contextRoot + "/manage/downloadLog",
				target : "_self",
				data : {
					logName : logs.val()
				}
			});
			$.fancybox.close();
		}
	});
	
	$(".dialogClose").click(function() {
		$.fancybox.close();
	});
	
	$("#closePW").click(function() {
		$.fancybox.close();
	});
	if (logs.size()) {
		// logs dropdown
		$.ajax({
			type : "POST",
			url : contextRoot + "/manage/logDropdown",
			success : function(map) {
				logs.setDropdown(map);
			}
		});
	}

});
