HiddenSubform
=============

![Screenshot](https://s3.amazonaws.com/catalyst-public/MooTools-Screenshots/HiddenSubform.png)

This class is designed to allow an easy way to inject segments of a form based on the state of a radio
button, checkbox, or select element.

How to use
----------

Simply wrap a section in a dom element and pass it to the class.  There are two ways that the hidden
subform can be revealed: it can be hidden on the page (using the class defined in options.hidden_class)
or it can be retrieved via AJAX (the contents of the hidden subform will be posted through the AJAX call).
Please see the example html for illustrations of both cases.

The activator is fired when the class is initialized, so you simply need to assign the value of the
select/radio if you want to default to a setting.

Options
-------

* activator_selector: This is the selector to look inside a hidden subform for the element to listen to.
* hidden_class: This is the class that will be applied to the elements that are hidden, if applicable.
* radio_event_type: What event to listen to if the activator is a radio button.
* stop_propagation: If true (default), stop the event that causes a view change.
* use_spinner: Set to true to use More/Spinner on the target element for AJAX calls. Default value is false.
* onLoad: A function to execute when the AJAX call returns. Will receive the new dom element as its single argument.
* options_selector: The tag in the option element to identify which dom element to show/hide based on whether it is the selected option.

