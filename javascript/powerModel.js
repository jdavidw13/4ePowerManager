var PowerId = (function() {
    var p = Model('powerId', function() {
        this.persistence(Model.localStorage);
        this.extend({
            getNextId: function() {
                var id = PowerId.find(0);
                if (id == null) {
                    id = new PowerId({id: 0, powerId: 0});
                    id.save();
                }
                var newId = id.attr('powerId');
                newId++;
                return newId;
            },
            saveNextId: function() {
                var nextId = PowerId.getNextId();
                var id = PowerId.find(0);
                id.attr('powerId', nextId);
                id.save();
            }
        });
    });
    return p;
}());

var Power = (function()
{
    var p = Model('power', function() {
        this.persistence(Model.localStorage);
        this.extend({
            createNew: function() {
                return new Power({id: PowerId.getNextId()});
            },

            getUsed: function() {
                return this.select(function() {
                    return this.isUsed();
                });
            },

            getUnused: function() {
                return this.select(function() {
                    return !this.isUsed();
                });
            }
        });

        this.include({
            isUsed: function() {
                var used = this.attr('powerUsed') || false;
                return used;
            },

            setUsed: function(used) {
                this.attr('powerUsed', used);
                this.save();
            }
        });
    });

    return p;
}());
