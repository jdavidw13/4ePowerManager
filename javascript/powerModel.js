var CurrentPowersVersion = (function() {
    var v = Model('currentVersion', function() {
        this.persistence(Model.localStorage);
        this.extend({
            getCurrentPowersVersion: function() {
                var version = CurrentPowersVersion.first();
                if (version) {
                    return version.attr('version');
                }
                return 1;
            },

            setCurrentPowersVersion: function(version) {
                var vo = CurrentPowersVersion.first();
                if (vo) {
                    vo.attr('version', version);
                }
                else {
                    vo = new CurrentPowersVersion({id: 0, version: version});
                }
                vo.save();
            }
        });
    });
    v.load();
    return v;
}());

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
    p.load();
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
            },

            updatePowersToLatestVersion: function() {
                var currentVersion = 2;

                var powersVersion = CurrentPowersVersion.getCurrentPowersVersion();
                if (powersVersion >= currentVersion) return;

                Power.each(function() {
                    var version = this.attr('_version') || 1;
                    if (version >= currentVersion) return;

                    var nextVersion = version + 1;
                    while (nextVersion <= currentVersion) {
                        switch (nextVersion) {
                            case 2:
                                this.attr('_version', nextVersion);
                                var powerUsed = this.attr('powerUsed') || 'unused';
                                if ('used' == powerUsed) powerUsed = true;
                                else powerUsed = false;
                                this.attr('powerUsed', powerUsed);
                                break;
                        }

                        nextVersion++;
                    }
                    this.save();
                });
                CurrentPowersVersion.setCurrentPowersVersion(currentVersion);
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

    p.load();
    return p;
}());
