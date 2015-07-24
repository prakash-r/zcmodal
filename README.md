# ZCModal
A jquery plugin for modal window used in creator live mode.
It is a fully customizable javascript plugin to generate popup window.

# Usage

This plugin helps to generate four types of modal window.

1. [*DEFAULT_MODAL*](#default_modal)
  - Basic modal which get body source from the target element
2. [*CLONE_MODAL*](#clone_modal)
  - This clones the target element and set as popup window body
3. [*AJAX_MODAL*](#ajax_modal)
  - The type of modal used jquery ajax call to get the modal body, here ajax response should be html
4. [*JIT_MODAL*](#jit_modal)
  - Just In Time modal generate modal window on the fly. The build dom method provides the body html

Now lets see the usage of each type of modal

### DEFAULT_MODAL

```js
$('#modalBody').zcmodal({
  title : "Default Modal",
  closeOnEsc : false,
  buttons : [
              {
                name : "Ok",
                type : Constants.MODAL_SUBMIT,
                action : function(modalBody){
                  // Do something
                }
              },
              {
                name : "Cancel",
                type : Constants.MODAL_CANCEL,
                action       : function(){}
              }
            ]
});
```
### CLONE_MODAL

```js
$('#modalBody').zcmodal({
  type : Constants.CLONE_MODAL,
  title : "Cloned Modal",
  showClose : false,
  buttons : [
              {
                name : "Ok",
                type : Constants.MODAL_SUBMIT,
                action : function(modalBody){
                  // Do something
                }
              },
              {
                name : "Cancel",
                type : Constants.MODAL_CANCEL,
                action       : function(){}
              }
            ]
});
```


### AJAX_MODAL

```js
$.zcmodal({
  type : Constants.AJAX_MODAL,
  title : "Ajax Modal",
  ajaxuri : "http://mydomain.com/pages/customers/profile/get",
  bodyClass : 'customer-profile'
});
```

### JIT_MODAL

```js
$.zcmodal({
  type : Constants.JIT_MODAL,
  title : "Just In Time Modal",
  buildDOM : function(){
    return '<div class="user-name"><input type="text" name="username"></div>';
  },
  buttons : []
});
```

### Buttons

```js
[
  {
    name : "Ok",  // Name of the button
    type : Constants.MODAL_SUBMIT,  // type of the button
    action : function(modalBody){ // action on clicking the button
      // Do something when clicking Ok
    }
  },
  {
    name : "Cancel",
    type : Constants.MODAL_CANCEL,
    action : function(){
      // Do something when cancel button is clicked
    }
  }
]
```


# Options

| Options       | Description |  Default |
| ------------- |-------------|----------|
|title  | title string that is shown in header of the popup | null|
| width     | width of the modal window in number Ex: 800 for 800px|  null  |
| height    | height of the modal window in number Ex: 400 for 400px| null  |
| offsetTop | Positioning window from top| 150  |
| showClose |  set this boolean to show close icon on right top corner  | false|
| closeOnEsc|  enable boolean to close window on pressing escape key | true |
| closeOnAnyClick | true to close window on click anywhere outside the popup i.e overlay| true|
| draggable | set true to enable draggable the window | false|
| hideHeader| true to hide popup header | false|
| hideFooter| true to hide popup footer | false|
| showInFullScreen| set true to occupy full screen used for add/edit record in view | false|
| showPreloader | enable this to show preloader while using ajax calls| false|
| type | this can be *DEFAULT_MODAL,CLONE_MODAL,AJAX_MODAL, JIT_MODAL* | DEFAULT_MODAL|
| ajaxuri| url to send ajax call for **AJAX_MODAL**|  null |
| buildDOM | it can be string/function that gives body dom html string for **JIT_MODAL** | null|
| buttons | this is an array of buttons objects with name, type and action. [Usage](#buttons)| []|
|bodyClass  | class name applied to the body to made custom style | null|
| beforeShow| it is a function that will call before showing popup used for event registration of body elements | null |
|beforeClose | function call before all form of close like escape, close icon,cancel..etc | null|
| afterClose| triggered once popup dom removed from the body  | null|

