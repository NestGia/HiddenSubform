/*
---
description: Utility for creating parts of a form that can be activated based on selections.

license: MIT-Style

name: HiddenSubform

authors:
 - Jon Baker

provides: HiddenSubform

requires: 
 - Core/Selectors
 - Core/Event
 - Core/Request.HTML
 - More/Spinner
 - Core/JSON
...
*/

/*
This class handles subforms that are hidden unless a radio button or checkbox is checked or a select option is selected.
It receives a dom element that contains both the actiavtor and the subforms.
For radio buttons, the activator should also contain a rel attribute, which is the selector for the corresponding subform.

For select buttons, the activator needs to be the select box, and the subform is going to be loaded via ajax.
The rel attribute must be in the form {'target':target_selector,'url':url}
The subform activator will first look in the container for the target using container.getElement(), then in the document
by calling $()
The url will receive the container of this object as the posted content.  The hidden subform container
will be submitted as the query string.

Alternatively, if you want to load all the dom elements with the page, you can not put a rel tag into the select
element and instead put the identifiers in the option's rel tags as with the radio buttons.

If needed, store into the container a function to execute when loaded.  Container is passed as the argument.
i.e. container.store('onLoad',function(){});
*/

var HiddenSubform = new Class({
    Implements: Options,

    options: {
        activator_selector: '.subform_activate',
        hidden_class: 'hidden', // The class to apply to hide the subform
        radio_event_type: 'click',
        stop_propagation: true,
        use_spinner: false,
        onLoad: $empty, // Function to execute on the content when an ajax subform is loaded
        options_selector: 'rel'
    },

    initialize: function(container, op) {
        container.store('hidden_subform',this);
        this.setOptions(op);
        this.container = container;
        this.init_subform(container);
    },

    add_activator: function(item) {
        var activator = this.options.activator_selector;
        var event_type = 'change';
        if (item.get('type') == 'radio' || item.get('type') == 'checkbox') {
            event_type = this.options.radio_event_type;
        }
        var subform = item.retrieve('hidden_subform');
        if ($chk(subform)) {
            // Already applied
            return event_type;
        }
        item.store('hidden_subform',this);
        item.addEvent(event_type,function(e) {
            if (this.options.stop_propagation && $chk(e)) {
                // DO NOT STOP THIS EVENT!  IT WILL PREVENT RADIO FROM BEING SELECTED IN IE!
                e.stopPropagation();
            } else {
                // Fire a change event on the parent form, if it exists
                var form = item.getParent('form');
                if ($chk(form)) {
                    form.fireEvent('change');
                }
            }
            this.change_views(item);
        }.bind(this));
        return event_type;
    },

    change_views: function(item) {
        // Manually setting the radio to selected will cause the click event to fire again!
        if (item.get('type') == 'radio' || item.get('type') == 'checkbox') {
            var rel = item.get(this.options.options_selector);
            if (item.get('checked')) {
                show = true;
                // Fire the change event for all other items
                this.container.getElements(this.options.activator_selector).each(function(deselect) {
                    if (deselect != item) {
                        //Check to be sure the other element isn't a checkbox to avoid getting stuck in a loop
                        if (deselect.get('type') != 'checkbox') {
                            deselect.fireEvent(this.options.radio_event_type);
                        }
                    }
                },this);
            }
            if ($chk(rel)) {
                var associated = this.container.getElement(rel);
                if ($chk(associated)) {
                    if (item.get('checked')) {
                        associated.removeClass(this.options.hidden_class);
                    } else {
                        associated.addClass(this.options.hidden_class);
                    }
                }
            }
        } else {
            var rel = item.get(this.options.options_selector);
            if ($chk(rel)) {
                var ajax = JSON.decode(rel);
                if ($chk(ajax)) {
                    var target = this.container.getElement(ajax.target);
                    if (!$chk(target)) {
                        target = $(ajax.target);
                    }
                    if ($chk(target)) {
                        if(this.options.use_spinner) {
                            target.set('spinner',{
                                'fxOptions':{
                                    'duration':0
                                }
                            });
                            target.spin();
                        }
                        var req = new Request.HTML({
                            'url':ajax.url,
                            'update':target,
                            'data':this.container.toQueryString(),
                            'method':'post',
                            onSuccess: function() {
                                this.options.onLoad(target);
                                var onload = this.container.retrieve('onLoad');
                                if ($chk(onload)) {
                                    onload(this.container);
                                }
                                var form = item.getParent('form');
                                if ($chk(form)) {
                                    form.fireEvent('change');
                                }
                                if (this.options.use_spinner) {
                                    target.unspin();
                                }
                                // This is to get the mask to redraw, if it exists
                                window.fireEvent('resize');
                            }.bind(this)
                        }).post();
                    }
                }
            } else {
                // Loop through the available options and check for their rel tags
                var on_div = null;
                item.getElements('option').each(function(option) {
                    var on = false;
                    if (option.selected) {
                        on = true;
                    }
                    var rel = option.get(this.options.options_selector);
                    if ($chk(rel)) {
                        var associated = this.container.getElement(rel);
                        if ($chk(associated)) {
                            if (on) {
                                on_div = associated;
                            } else {
                                associated.addClass(this.options.hidden_class);
                            }
                        }
                    }
                },this);
                if($chk(on_div)) {
                    on_div.removeClass(this.options.hidden_class);
                }
            }
        }
        // Fire a resize event on the window
        window.fireEvent('resize');
    },

    init_subform: function(container) {
        var activator = this.options.activator_selector;
        container.getElements(activator).each(function(item) {
            var event_type = this.add_activator(item);
            this.change_views(item);
        //item.fireEvent(event_type);
        },this);
    }
});
