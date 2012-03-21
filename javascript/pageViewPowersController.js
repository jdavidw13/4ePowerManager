var Controllers = (function(controllers) {
    var c = {};
    var lastDisplayedList = null;
    c.displayList = function(filter) {
        lastDisplayedList = filter;
        var appendPowers = function() {
            var element = $('<a href="#pagePowerView" data-role="button"></a>');
            $(element).append(this.attr('name'));
            $(element).data('id', this.attr('id'));
            $(element).click(function() {
                $('#pagePowerView').data('id', $(this).data('id'));
            });
            $('#powersList').append(element);
        };
        $('#powersList').children().remove();
        $('#powersListTitle').html('Powers');
        if ('All' == filter || !filter) {
            Power.each(appendPowers);
        }
        else if ('Used' == filter) {
            Power.select(function() {
                var used = this.attr('powerUsed');
                return used == 'used';
            }).each(appendPowers);
        }
        else if ('Unused' == filter) {
            Power.select(function() {
                var used = this.attr('powerUsed');
                return used == 'unused' || !used;
            }).each(appendPowers);
        }
        else if ('At-Will' == filter
                || 'Encounter' == filter
                || 'Daily' == filter) {
            Power.select(function() {
                var powerType = this.attr('powerType');
                return filter == powerType;
            }).each(appendPowers);
        }
        if (filter) {
            var title = $('#powersListTitle').html();
            title += ' - '+filter;
            $('#powersListTitle').html(title);
        }
        $('#pageViewPowers').trigger('create');
    };
    c.pageShow = function() {
        if (lastDisplayedList) {
            c.displayList(lastDisplayedList);
        }
    };

    controllers.viewPowers = c;
    return controllers;
}(Controllers || {}));
$(function() {
    var clickFunc = function() { Controllers.viewPowers.displayList($.trim($(this).html())); };
    $('#filterAll').click(clickFunc);
    $('#filterUsed').click(clickFunc);
    $('#filterUnused').click(clickFunc);
    $('#filterAtWill').click(clickFunc);
    $('#filterEncounter').click(clickFunc);
    $('#filterDaily').click(clickFunc);
    $('#pageViewPowers').live('pageshow', function() {
        Controllers.viewPowers.pageShow();
    });
});
