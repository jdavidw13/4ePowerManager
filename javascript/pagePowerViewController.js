var Controllers = (function(controllers) {
    var headerTemplate = '' +
        '<div data-role="header" id="headerbar" data-theme="{{swatch}}" align="center">' +
            '<h3 id="powerName">{{powerName}}</h3>' +
        '</div>';

    var powerUsedTemplate = '' +
        '<fieldset data-role="controlgroup">' +
            '<li data-swatch="{{swatch}}" class="ui-li ui-li-divider ui-btn ui-bar-{{swatch}} ui-corner-top ui-btn-up-undefined" data-role="list-divider" role="" data-form="ui-bar-{{swatch}}">{{powerType}} Power</li>' +
            '<input id="powerUsed" name="powerUsed" type="checkbox">' +
            '<label for="powerUsed">' +
                'Power Used' +
            '</label>' +
        '</fieldset>'; 

    var toHitCollapseTemplate = '' +
        '<div data-role="collapsible" data-collapsed="false" data-content-theme="d">' +
            '<h3>' +
                'ToHit: {{toHitText}}' +
            '</h3>' +
            '<a id="btnRollToHit" data-role="button" href="#">' +
                'Roll ToHit' +
            '</a>' +
        '</div>'; 

    var damageCollapseTemplate = '' +
        '<div data-role="collapsible" data-collapsed="false" data-content-theme="d">' +
            '<h3 id="damageRangeText">' +
                '{{damageRangeText}}' +
            '</h3>' +
            '<p style="font-weight: bold">Base Damage: {{baseDamage}}</p>' +
            '<a id="btnRollDamage" data-role="button" data-theme="a" href="#">' +
                'Roll Damage' +
            '</a>' +
            '<div id="checkboxes5" data-role="fieldcontain">' +
                '<fieldset data-role="controlgroup" data-type="vertical">' +
                    '<legend>' +
                        'Conditional Damage:' +
                    '</legend>' +
                    '{{#conditionalDamage}}' +
                    '<input id="{{name}}" name="chbxConditionalDamage_{{name}}" type="checkbox">' +
                    '<label for="{{name}}">' +
                        '{{name}} :: {{damage}}' +
                    '</label>' +
                    '{{/conditionalDamage}}' +
                '</fieldset>' +
            '</div>' +
        '</div>'; 

    var pagePowerView = {};
    var rollType = null;
    var currentPower = null;
    var $conditionalDamage = null;

    pagePowerView.displayPower = function(id) {
        var power = Power.find(id);
        if (power != null) {
            currentPower = power;
        }
        var powerType = power.attr('powerType');
        var swatch = 'd';
        switch (powerType) {
            case 'At-Will':
                swatch = 'a';
                break;
            case 'Encounter':
                swatch = 'b';
                break;
            case 'Daily':
                swatch = 'c';
                break;
        }
        $('#headerbar').replaceWith(Mustache.render(headerTemplate, {swatch:swatch, powerName:power.attr('name')}));

        $('#powerDescription').html(power.attr('description'));

        var toHitText = Mustache.render(toHitCollapseTemplate, {toHitText: getToHitText()});
        $('#toHitCollapsable').html(toHitText);
        $('#btnRollToHit').click(function() {
            rollToHit();
        });

        var damageTemplate = Mustache.render(damageCollapseTemplate, {
            damageRangeText: 'Damage Range: '+getDamageRangeText(), 
            conditionalDamage: power.attr('conditionalDamage'),
            baseDamage: power.attr('damage')
        });
        $('#damageCollapsable').html(damageTemplate);
        $conditionalDamage = $('input[name*="chbxConditionalDamage"]');
        $conditionalDamage.change(function() {
            conditionalDamageChanged();
        });
        $('#btnRollDamage').click(function() {
            rollDamage();
        });

        $('#powerUsedContainer').html(Mustache.render(powerUsedTemplate, {swatch: swatch, powerType: powerType}));

        $('#pagePowerView').trigger('create');

        //var powerUsed = power.attr('powerUsed') || 'unused';
        var powerUsed = power.attr('powerUsed');
        $('#powerUsed').prop('checked', powerUsed).checkboxradio('refresh');

        $('#headerbar').removeClass('ui-bar-d').addClass('ui-bar-'+swatch);
    };

    var getConditionalDamageValue = function(damageName) {
        var condDamage = _.find(currentPower.attr('conditionalDamage'), function(damage) {
            return damageName == damage.name;
        });
        return condDamage.damage;
    };
    var getDamage = function() {
        var total = currentPower.attr('damage');
        $('input[name*="chbxConditionalDamage"]:checked').each(function() {
            var value = getConditionalDamageValue($(this).attr('id'));
            if (value.indexOf('d') == -1) {
                var valInt = parseInt(value);
                if (valInt < 0) {
                    total += ' - ' + valInt;
                }
                else {
                    total += ' + ' + valInt;
                }
            }
            else {
                total += ' + ' + value;
            }
        });
        return total;
    };
    var getDamageRangeText = function() {
        var damage = getDamage();
        var min = parsePrecedence(damage, 'min');
        var max = parsePrecedence(damage, 'max');
        return min.total + ' - ' + max.total;
    };
    var getToHitRoll = function() {
        var toHit = currentPower.attr('toHit');
        var toHitText = '1d20 ';
        if (toHit > 0) {
            toHitText += '+ ' + toHit;
        }
        else if (toHit < 0) {
            toHitText -= '- ' + toHit;
        }

        return toHitText;
    };
    var getToHitText = function() {
        var vs = currentPower.attr('vs');
        var text = getToHitRoll();
        text += ' vs '+vs;
        return text;
    };
    var conditionalDamageChanged = function() {
        var damageText = 'Damage Range: '+getDamageRangeText();
        $('#damageRangeText span.ui-btn-text').html(damageText);
    };
    var rollToHit = function() {
        var roll = parsePrecedence(getToHitRoll());
        var vs = currentPower.attr('vs');

        var content = '<div align="center">';
        if (roll.rolls[0] == 20) {
            content += '<h2>Natural 20!</h2>';
        }
        content += '<h3>'+roll.total+' vs '+vs+'</h3></div>';
        content += '<a rel="close" data-role="button" href="#">Close</a>';

        $('<div>').simpledialog2({
            mode: 'blank',
            headerText: 'ToHit Roll',
            headerClose: true,
            blankContent: content
        });
    };
    var rollDamage = function() {
        var damage = getDamage();
        var roll = parsePrecedence(damage);

        var content = '<div align="center"><h3>'+roll.total+'</h3></div>';
        content += '<a rel="close" data-role="button" href="#">Close</a>';
        $('<div>').simpledialog2({
            mode: 'blank',
            headerText: 'Damage Roll',
            headerClose: true,
            blankContent: content
        });
    };
    pagePowerView.setPowerUsed = function(val) {
        var power = currentPower;
        power.attr('powerUsed', val);
        power.save();
    };
    pagePowerView.editPower = function() {
        $('#pageAddEdit').data('id', currentPower.attr('id'));
        $.mobile.changePage('#pageAddEdit');
    };

    controllers.pagePowerView = pagePowerView;
    return controllers;
}(Controllers || {}));

$(function() {
    $('#pagePowerView').live('pageinit', function() {
        $('#powerUsed').change(function() {
            Controllers.pagePowerView.setPowerUsed($(this).is(':checked'));
        });
        $('#btnEditPower').click(function() {
            Controllers.pagePowerView.editPower();
        });
    });
    $('#pagePowerView').live('pageshow', function() {
        var id = $('#pagePowerView').data('id');
        Controllers.pagePowerView.displayPower(id);
    });
});
