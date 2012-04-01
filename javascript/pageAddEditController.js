var Controllers = (function(controllers) {
    var c = {};
    var pageAddEdit = {};
    var saveNextId = false;

    var clearFields = function() {
        $('#conditionalDamageControls').children().remove();
        $('#addEditNameOfPower').val('');
        $('#addEditVS').val('');
        $('#addEditToHit').val('');
        $('#addEditDamage').val('');
        $('#addEditDescription').val('');
        $('input[name="addEditPowerType"]:checked').attr('checked', false).next('label').removeClass('ui-btn-active');
    };
    var addConditionalDamageKeypressEvent = function(inputElement) {
        var lastTime = null;
        var timerId = null;
        var doPress = function() {
            var currentTime = new Date().getTime();
            if (lastTime != null) {
                if (currentTime - lastTime < 1000) return;
            }
            var words = getWords(additionalDamageTrie, $(inputElement).val().toLowerCase());
            if (words.length > 0) {
                var buttons = {};
                for (var i = 0; i < words.length; i++) {
                    buttons[words[i]] = {
                        click: function(e, word, damageId) {
                            var damage = getProperty(additionalDamageTrie, word, 'damage');
                            $(inputElement).val(word);
                            $('#addDamageDamage'+damageId).val(damage);
                        },
                        args: [words[i], parseInt($(inputElement).attr('id').replace('addDamageName', ''))]
                    };
                }
                $('<div>').simpledialog2({
                    mode: 'button',
                    headerText: 'Damage...',
                    headerClose: true,
                    buttons: buttons
                });
            }
        };
        $(inputElement).keypress(function() {
            lastTime = new Date().getTime();
            if (timerId != null) {
                clearTimeout(timerId);
            }
            timerId = setTimeout(function(){ doPress(); }, 1000);
        });
    };
    c.newPower = function() {
        pageAddEdit.currentPower = Power.createNew();
        clearFields();
        saveNextId = true;
    };
    c.pageDisplayed = function() {
        var id = $('#pageAddEdit').data('id');
        $('#pageAddEdit').data('id', null);
        if (id == null) {
            c.newPower();
        }
        else {
            saveNextId = false;
            c.displayPower(id);
        }
    };
    c.displayPower = function(id) {
        clearFields();
        var power = Power.find(id);
        pageAddEdit.currentPower = power;
        $('#addEditNameOfPower').val(power.attr('name'));
        $('#addEditVS').val(power.attr('vs'));
        $('#addEditToHit').val(power.attr('toHit'));
        $('#addEditDamage').val(power.attr('damage'));
        $('#addEditDescription').val(power.attr('description'));
        $('#addEditPowerType').val(power.attr('powerType'));
        $('input[name="addEditPowerType"][value="'+power.attr('powerType')+'"]').attr('checked', true).next('label').addClass('ui-btn-active');

        var conditionalDamage = power.attr('conditionalDamage');
        if (conditionalDamage != null) {
            for (var id = 0; id < conditionalDamage.length; id++) {
                var html = '<fieldset data-role="fieldcontain"><label for="addDamageName' + id + '">Name</label>';
                html += '<input type="text" id="addDamageName' + id +'" value="'+conditionalDamage[id].name+'"/>';
                html += '<label for="addDamageDamage' + id + '">Damage</label>';
                html += '<input type="text" id="addDamageDamage' + id +'" value="'+conditionalDamage[id].damage+'"/></fieldset>';
                $('#conditionalDamageControls').append(html);
            }
            $('#contitionalDamageSet').trigger('create');
        }
    };
    c.getCurrentPower = function() {
        return pageAddEdit.currentPower;
    };
    c.addAdditionalDamage = function() {
        var currentPower = pageAddEdit.currentPower;
        var conditionalDamage = currentPower.attr('conditionalDamage');
        if (conditionalDamage == null) {
            conditionalDamage = new Array();
            currentPower.attr('conditionalDamage', conditionalDamage);
        }
        var id = conditionalDamage.length;
        conditionalDamage[id] = {name:'', damage:''};
        var html = '<fieldset data-role="fieldcontain"><label for="addDamageName' + id + '">Name</label>';
        html += '<input type="text" id="addDamageName' + id +'"/>';
        html += '<label for="addDamageDamage' + id + '">Damage</label>';
        html += '<input type="text" id="addDamageDamage' + id +'"/></fieldset>';
        $('#conditionalDamageControls').append(html);
        addConditionalDamageKeypressEvent($('#addDamageName'+id));
        $('#contitionalDamageSet').trigger('create');
    };
    c.savePower = function() {
        var p = pageAddEdit.currentPower;
        p.attr('name', $('#addEditNameOfPower').val());
        p.attr('vs', $('#addEditVS').val());
        p.attr('toHit', $('#addEditToHit').val());
        p.attr('damage', $('#addEditDamage').val());
        p.attr('description', $('#addEditDescription').val());
        p.attr('powerType', $('input[name="addEditPowerType"]:checked').val());
        $('#conditionalDamageControls').children().children(':input').each(function() {
            var id = $(this).attr('id');
            var damageSplit = id.split('addDamageDamage');
            var nameSplit = id.split('addDamageName');
            var damageArray = p.attr('conditionalDamage');
            if (damageSplit.length > 1) {
                damageArray[parseInt(damageSplit[1])].damage = $(this).val();
            }
            if (nameSplit.length > 1) {
                damageArray[parseInt(nameSplit[1])].name = $(this).val();
            }
            p.attr('conditionalDamage', damageArray);
        });
        p.save();
        var damageArray = p.attr('conditionalDamage');
        if (damageArray) {
            for (var i = 0; i < damageArray.length; i++) {
                var words = getWords(additionalDamageTrie, damageArray[i].name);
                if (words.length < 1) {
                    setProperty(additionalDamageTrie, damageArray[i].name.toLowerCase(), 'damage', damageArray[i].damage);
                }
            }
        }
        if (saveNextId) {
            PowerId.saveNextId();
            saveNextId = false;
        }
        $('<div>').simpledialog2({
            mode: 'button',
            headerText: 'Power Saved',
            headerClose: false,
            buttonPrompt: 'The power has been saved!',
            buttons: {
                'Ok': {
                    click: function() {}
                }
            }            
        });
    };
    c.deletePower = function() {
        $('<div>').simpledialog2({
            mode: 'button',
            headerText: 'Delete Power',
            headerClose: false,
            buttonPrompt: 'Delete this power?',
            buttons: {
                'Delete': {
                    click: function() {
                        pageAddEdit.currentPower.destroy();
                        c.newPower();
                    }
                },
                'Cancel': {
                    click: function() {
                    },
                    icon: 'delete'
                }
            }
        });
    };

    controllers.pageAddEdit = c;
    return controllers;
}(Controllers || {}));

$(function() {
    Controllers.pageAddEdit.newPower();
    $('#btnAddConditionalDamage').click(function() {
        Controllers.pageAddEdit.addAdditionalDamage();
    });
    $('#btnSavePower').click(function() {
        Controllers.pageAddEdit.savePower();
    });
    $('#pageAddEdit').live('pageshow', function() {
        Controllers.pageAddEdit.pageDisplayed();
    });
    $('#btnDeletePower').click(function() {
        Controllers.pageAddEdit.deletePower();
    });
});
