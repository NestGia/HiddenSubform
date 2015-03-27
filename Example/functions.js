function init_page() {
    $$('.hidden_subform').each(function(subform) {
        var hidden_subform = new HiddenSubform(subform);
    });
}

window.addEvent('domready',init_page);
