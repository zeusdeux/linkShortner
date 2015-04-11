var $ = require('jquery');

function resetTextAndHide(arr) {
  arr.forEach(function($el) {
    $el.children('span').text('');
    $el.children('a').text('').attr('href', '');
    $el.addClass('hidden');
  });
}

$('#mainForm').on('submit', function(e) {
  const $err = $('.error');
  const $success = $('.success');
  const $info = $('.info');
  const val = $('#inputUrl').val();

  e.preventDefault();
  resetTextAndHide([$err, $success, $info]);
  if (!val) {
    $('#errorMsg').text('Input url shouldn\'t be empty');
    $err.removeClass('hidden');
  }
  else {
    $.post('/shorten', {
        inputUrl: val
      })
      .done(function(data) {
        const shortUrl = location.protocol + '//' + location.host + '/' + data.id;

        $('#successMsg').text(shortUrl).attr('href', shortUrl);
        $success.removeClass('hidden');

        $('#infoMsg').text(data.useCount);
        $info.removeClass('hidden');
      })
      .fail(function(err) {
        $('#errorMsg').text(err.responseText);
        $err.removeClass('hidden');
      });
  }
});

// focus on the sole text input
$('#inputUrl').focus();
