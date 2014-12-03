$(function(){

  $('#upload').on('change', function(){
    $('#afterPic').removeClass('hide');
  });

  $('#uploadForm').on('submit', function(){
    $('#afterPic').hide();
    $('#loading').show();
  });

  $('#showMore').on('click', function(){
    $('#more').show();
  });

});