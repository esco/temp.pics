(function($){

  $(function(){
    $('img').error(function(){
      var parent = $(this).parents('.pic');
      var src = $(this).attr('src');

      $.post('/broken', {
        src: src
      });

      $(this).fadeOut({
        complete: function(){
          parent.fadeOut();
        }
      })
    });
  });

})(jQuery);