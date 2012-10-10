/* 
* Enable pjax links moovweb style.
*/


$(document).ready(
  function() {
    console.log("heyasdfsqdF")

//  $(document).pjax("a").on('pjax:error', function(e, xhr, err) {

/*  $("a").pjax().on('pjax:error', function(e, xhr, err) {
      console.log('Something went wrong: ' + err);
  })*/

/*    $("[data-pjax]").each(
      function(elem) {
        
      }
    );
*/

  $(document).pjax('a[data-pjax]');

  }
);