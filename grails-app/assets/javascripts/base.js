var alertDiv;
function checkError(xhr) {
	alertDiv = alertDiv?alertDiv:$("#alertDiv");
	if (xhr.responseText && xhr.responseText.indexOf("Message:") == 0) {
		//alert(xhr.responseText || "程式錯誤，請通知資訊人員!");		
		alertDiv.find("#content").text(xhr.responseText || "程式錯誤，請通知資訊人員!").end().modal('show');
	} else if (xhr.responseText && xhr.responseText.indexOf("sessionError") == 0) {
		//alert("請重新登入");
		alertDiv.find("#content").text("請重新登入").end().modal('show');
		window.location.reload();
	} else {
		//alert("程式錯誤，請通知資訊人員!");
		alertDiv.find("#content").text("程式錯誤，請通知資訊人員!").end().modal('show');
	}
}

/**
 * override grid
 */
(function($) {
	$.extend($.jgrid.defaults, {
		rowNum : 10,
		scroll : 1,
		hidegrid : false,
		datatype : "json",
		height : 100,
		rownumbers : true,
		mtype : 'POST',
		autowidth : true,
		forceFit : true,
		loadError : checkError
	});
	var _jqGrid = $.fn.jqGrid;
	$.fn.jqGrid = function() {
		if (!arguments.length) {
			alert("argument error");
			return this;
		}

		if ((this.is("div") || !this.is("[role=grid]")) && typeof arguments[0] === 'object') {
			var id = this.attr("id");
			this.append($("<table />", {
				id : id
			})).addClass("r-grid").removeAttr("id");
			// add pager
			arguments[0].pager && this.append($("<div />", {
				id : id + "-pager"
			})) && $.extend(arguments[0], {
				pager : id + "-pager",
				hidegrid : false
			});

			var s = arguments[0];

			// add header
			var _colNames = s.colNames || [];
			s.colNames = [];
			for (var col in s.colModel) {
				s.colNames.push(_colNames[col] || s.colModel[col].header || s.colModel[col].name);
			}
			// add columns info
			s = $.extend({}, s, {
				postData : $.extend(s.postData || {}, {
					columnParam : JSON.stringify(s.colModel, null),
					groupCloumn : JSON.stringify(s.groupingView && s.groupingView.groupField || [], null),
					mtype : "post"
				})
			});

			var resGrid = _jqGrid.call(this.is("table") ? this : this.find("table"), s);
			s.pager && resGrid.navGrid("#" + id + "-pager", {
				del : false,
				add : false,
				edit : false,
				search : false
			});
			return resGrid;
		}
		//
		return _jqGrid.apply(this.is("table") ? $(this) : $(this.find("table")), arguments);
	};
	$.extend($.fn.jqGrid, _jqGrid);
})(jQuery);

$.ajaxSetup({
	//jsonp : null,
	//jsonpCallback : null,
	type : "POST",
	error : checkError
});

$.extend($.fn, {
	// put下拉選單
	setDropdown : function(data, append) {
		!append && this.html('') && this.append($('<option></option>'));
		var $this = this;
		$.each(data, function(value, data) {
			if ( typeof data === 'string') {
				$this.append($('<option></option>').val(value).text(data));
			} else {
				$this.append($('<option>', data));
			}

		});
		return this;
	}, // HTML5 autocomplete
	setAutocomplete : function(data, append) {
		$('body').append('<datalist id="' + $(this).attr('id') + 'datalist' + '"></datalist>');
		var datalist = $('#' + $(this).attr('id') + 'datalist');
		!append && datalist.html('') && datalist.append($('<option></option>'));

		$.each(data, function(value, data) {
			if ( typeof data === 'string') {
				datalist.append($('<option></option>').val(value).text(data));
			} else {
				datalist.append($('<option>', data));
			}
		});
		$(this).attr("list", datalist.attr('id'));
		return this;
	},
	serializeData : function() {
		var res = {}, fields = this.find(":input,:disabled").serializeArray();
		$("#results").empty();
		$.each(fields, function(i, field) {
			if (res[field.name]) {
				$.isArray(res[field.name]) ? res[field.name].push(field.value) : (res[field.name] = [field.value]);
			} else {
				res[field.name] = field.value;
			}
		});
		return res;
	},
	gridSerialize : function(stringify) {
		var data = [];
		if ($(this).attr('role') == 'grid') {
			var tGrid = $(this);			
			tGrid.find('tr[id]').each(function() {
				data.push($.extend(tGrid.getRowData($(this).attr('id')), {
					rowId : $(this).attr('id')
				}));
			});
		}
		return stringify ? JSON.stringify(data) : data;
	},
	injectData : function(datas) {

	}
});

// APIS
var API = {
	loadPage : function(href) {
		var section = $("section");
		section.animate({
			opacity : 0.01
		}, 100, (function(loadHref) {
			return function() {
				section.load(loadHref, function() {
					API.loadInit.call(section);
					section.animate({
						opacity : 1
					}, 200);
				});
			};
		})(href));
	},
	loadInit : function() {
		var $this = $(this);
		// $this.find("button,.button").button();
		$("i").addClass("icon-white");
		// jquery Validate Setting
		$(".error").addClass("help-inline");
		$.validator.addMethod("loginId", function(value, element) {
			return this.optional(element) || /^[a-zA-Z0-9]{4,20}$/i.test(value);
		}, "登入 Id限英文字母、數字及至少四位!");
	},
	formSubmit : function(settings) {
		settings = $.extend(true, {
			data : {},
			type : 'POST',
			url : "",
			target : "_target"
		}, settings || {});
		var obj = $('<form style="display:none" />');
		obj.attr({
			action : settings.url,
			target : settings.target,
			method : settings.type
		});
		for (var key in settings.data) {
			obj.append('<input type="hidden" name="' + key + '" id="' + key + '" value=\'' + settings.data[key] + '\' />');
		}
		$('body').append(obj);
		obj.submit();
		obj.empty().remove();
	},
	padZero : function(str, max) {
		str += "";
		while (str.length < max)
		str = "0" + str;
		return str;
	}	
};

// first
$(document).ready(function() {
	API.loadInit.call(document);
});
