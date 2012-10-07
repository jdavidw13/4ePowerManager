var Controllers = (function(controllers) {
    var toHitCollapseTemplate = '' +
        '<div data-role="collapsible" data-collapsed="false" data-content-theme="d">' +
            '<h3>' +
                'ToHit: {{toHitText}}' +
            '</h3>' +
            '<a id="btnRollToHit" data-role="button" data-theme="a" href="#">' +
                'Roll ToHit' +
            '</a>' +
        '</div>'; 

    var damageCollapseTemplate = '' +
        '<div data-role="collapsible" data-collapsed="false" data-content-theme="d">' +
            '<h3 id="damageRangeText">' +
                '{{damageRangeText}}' +
            '</h3>' +
            '<a id="btnRollDamage" data-role="button" data-theme="a" href="#">' +
                'Roll' +
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

    pagePowerView.displayPower = function(id) {
        currentPower = Power.find(id);
        var power = currentPower;
        pagePowerView.currentPower = power;
        $('#powerName').html(power.attr('name'));

        $('#powerDescription').html(power.attr('description'));

        //var powerUsed = power.attr('powerUsed') || 'unused';
        var powerUsed = power.attr('powerUsed');
        $('#powerUsed').prop('checked', powerUsed).checkboxradio('refresh');

        var toHit = power.attr('toHit');
        var toHitVs = power.attr('vs');
        var toHitText = '1d20 ';
        if (toHit > 0) {
            toHitText += '+ ' + toHit + ' ';
        }
        else if (toHit < 0) {
            toHitText -= '- ' + toHit +' ';
        }
        toHitText += 'vs ' + toHitVs;

        toHitText = Mustache.render(toHitCollapseTemplate, {toHitText: toHitText});
        $('#toHitCollapsable').html(toHitText);

        var damageTemplate = Mustache.render(damageCollapseTemplate, {damageRangeText: getDamageRangeText(), conditionalDamage: power.attr('conditionalDamage')});
        $('#damageCollapsable').html(damageTemplate);
        $conditionalDamage = $('input[name*="chbxConditionalDamage"]');

        $('#pagePowerView').trigger('create');

        /*
        var conditionalDamage = power.attr('conditionalDamage');
        $('#viewConditionalDamage').children().remove();
        if (conditionalDamage != null && conditionalDamage.length > 0) {
            $('#viewConditionalDamage').append('<legend>Conditional Damage:</legend>');
            for (var i = 0; i < conditionalDamage.length; i++) {
                var damage = conditionalDamage[i];
                var chbxName = "chbxConditionalDamage"+i;
                var html = '<input name="'+chbxName+'" id="'+chbxName+'" type="checkbox" />';
                html += '<label for="chbxConditionalDamage'+i+'">'+damage.name+'  ::  '+damage.damage+'</label>';
                $('#viewConditionalDamage').append(html);
                $('#'+chbxName).data('damage', damage.damage);
                $('#'+chbxName).click(function() {
                    setDamageRangeText();
                    pagePowerView.setRollType(rollType);
                });
            }
        }

        $('#rollTypeText').html('');
        $('#rollValueText').html('');

        setDamageRangeText();

        */
        $('#pagePowerView').trigger('create');
    };
    function getConditionalDamageValue(damageName) {
        var condDamage = _.find(currentPower.attr('conditionalDamage'), function(damage) {
            return damageName == damage.name;
        });
        return condDamage.damage;
    };
    function getDamage() {
        var total = currentPower.attr('damage');
        //var total = pagePowerView.currentPower.attr('damage');
        $('input[name*="chbxConditionalDamage"]:checked').each(function() {
            var value = getConditionalDamageValue($(this).attr('id'));
            //var value = $(this).data('damage');
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
    function getDamageRangeText() {
        var damage = getDamage();
        var min = parsePrecedence(damage, 'min');
        var max = parsePrecedence(damage, 'max');
        return min.total + ' - ' + max.total;
    };
    pagePowerView.setRollType = function(type) {
        rollType = type;
        if ('toHit' == type) {
            var bonus = parseInt(pagePowerView.currentPower.attr('toHit'));
            var roll = '1d20 ';
            if (bonus < 0) {
                roll += '- ' + Math.abs(bonus);
            }
            else {
                roll += '+ ' + bonus;
            }
            $('#rollTypeText').html(roll+' VS '+pagePowerView.currentPower.attr('vs'));
        }
        else if ('damage' == type) {
            $('#rollTypeText').html(getDamage());
        }

        $('#rollTypeText').trigger('create');
    };
    pagePowerView.roll = function() {
        if (rollType == null) {
            return;
        }
        var rollText = '';
        if ('toHit' == rollType) {
            rollText = '1d20';
            var bonus = parseInt(pagePowerView.currentPower.attr('toHit') || '0');
            if (bonus < 0) {
                rollText += '-'+Math.abs(bonus);
            }
            else {
                rollText += '+'+bonus;
            }
            var rollObj = parsePrecedence(rollText);
            if (rollObj.rolls[0] == 20) {
                $('#rollValueText').html('NATURAL 20!!! (' + rollObj.total +')');
            }
            else {
                $('#rollValueText').html(rollObj.total + ' VS ' + pagePowerView.currentPower.attr('vs'));
            }
        }
        else if ('damage' == rollType) {
            rollText = getDamage();
            var rollObj = parsePrecedence(rollText);
            $('#rollValueText').html(rollObj.total);
        }
        $('#rollValueText').trigger('create');
    };
    pagePowerView.setPowerUsed = function(val) {
        var power = pagePowerView.currentPower;
        power.attr('powerUsed', val);
        power.save();
    };
    pagePowerView.editPower = function() {
        $('#pageAddEdit').data('id', pagePowerView.currentPower.attr('id'));
    };

    controllers.pagePowerView = pagePowerView;
    return controllers;
}(Controllers || {}));

$(function() {
    $('#pagePowerView').live('pageshow', function() {
        var id = $('#pagePowerView').data('id');
        Controllers.pagePowerView.displayPower(id);
    });
    $('input[name="rollType"]').click(function() {
        Controllers.pagePowerView.setRollType($(this).val());
    });
    $('#btnRoll').click(function() {
        Controllers.pagePowerView.roll();
    });
    $('#powerUsed').change(function() {
        Controllers.pagePowerView.setPowerUsed($(this).val());
    });
    $('#btnEditPower').click(function() {
        Controllers.pagePowerView.editPower();
    });
});
