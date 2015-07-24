# ZCModal
A jquery plugin for modal window used in creator live mode.
It is a fully customizable javascript plugin to generate popup window.

# Usage

This plugin helps to generate four types of modal window.
- *DEFAULT_MODAL* - Basic modal which get body source from the target element
- *CLONE_MODAL* - This clones the target element and set as popup window body
- *AJAX_MODAL* - The type of modal used jquery ajax call to get the modal body, here ajax response should be html
- *JIT_MODAL* - Just In Time modal generate modal window on the fly. The build dom methoda provides the body html

Now lets see the usage of each type of modal

### DEFAULT_MODAL

```js
$('#modalBody').zcmodal({
  title : "Default Modal",
  closeOnEsc : false
});
```
### CLONE_MODAL

```js
$('#modalBody').zcmodal({
  type : Constants.CLONE_MODAL,
  title : "Cloned Modal",
  showClose : false
});
```


### AJAX_MODAL

