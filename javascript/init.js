var additionalDamageTrie = null;
$(function() {
    Power.each(function() {
        var additionalDamage = this.attr('conditionalDamage');
        if (!additionalDamage) {
            return;
        }
        for (var i = 0; i < additionalDamage.length; i++) {
            var word = additionalDamage[i].name.toLowerCase();
            additionalDamageTrie = buildTrie([word], additionalDamageTrie);
            setProperty(additionalDamageTrie, word, 'damage', additionalDamage[i].damage);
        }
    });
});
