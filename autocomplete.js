/*
 * This file is part of Milx.
 *
 * Milx is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Milx is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Milx.  If not, see <http://www.gnu.org/licenses/lgpl-3.0.txt>.
 */
/**
 * @author Connecta Sistemas
 * @version 0.1
 */
(function ($){
	// TODO cache query support
	$.autocomplete_defaults = {
		min: 3,
		formatItem: function(i) { return i; },
		data: {}
	}
	$.fn.autocomplete = function (url, opts)
	{
		var opts = $.extend({}, $.autocomplete_defaults, opts);
		this.each(function () {
			var $el = $(this).attr('autocomplete', 'off');
			var offset = $el.offset();
			var $result = $('<ul class="autocomplete" id="autocomplete_result_' + this.id + '" style="position:absolute"></ul>').appendTo('body').css({
				top: offset.top + $el[0].offsetHeight,
				left: offset.left
			});
			var cache = new Array();
			$el.keyup(function (e) {
				var value = $el.val();
				if (!moveSelected(e)) {
					if (value.length >= opts.min) {
						/* if (cache.size() > 0)
							$.autocomplete.pushResults(cache);
						else */
							$.ajax({
							type: 'GET',
								url: url,
								dataType: 'json',
								data: $.merge({'q': value}, opts.data),
							success: pushResults
							});
					}
				}
			});
			var selected = 0;
			//$el.blur(function () { $result.hide(); }); // TODO: clicar fora do UL

			function moveSelected(e)
			{
				var prev = selected; var moved = false;
				if ($result.is(':visible')) {
					if (e.keyCode == 38) { // UP
						if (selected > 1)
							selected--;
						moved = true;
					} else if (e.keyCode == 40) { // Down
						if (selected < cache.length)
							selected++;
						moved = true;
					} else if (e.keyCode == 13) { // Enter
						if (selected > 0 && selected <= cache.length)
							select(selected - 1);
						e.preventDefault();
						return true;
					} else if (e.keyCode == 27) { // ESC
						$result.hide();
						return true;
					}
				}
				$result.children('li:nth-child(' + prev + ')').removeClass('selected');
				$result.children('li:nth-child(' + selected + ')').addClass('selected');
				return moved;
			}

			function pushResults(result)
			{
				cache = result;
				$result.html('');
				if (result.length == 0)
					opts.onNoneFound();
				else
					for (var i in result)
						$('<li>' + opts.formatItem(result[i]) + '</li>').appendTo($result).bind('click', i, function (e) {
							select(e.data);
						});
				$result.show();
			}

			function select(which)
			{
				$el.val(opts.formatResult(cache[which]));
				opts.onSelect(cache[which]);
				$result.hide();
			}
		});
	}
})(jQuery);
