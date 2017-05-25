$(function() {
    // animation
    var $window = $(window),
        win_height_padded = $window.height() * 1.1,
        isTouch = Modernizr.touch;
    if (isTouch) {
      $('.revealOnScroll').addClass('animated');
    }
    $window.on('scroll load', revealOnScroll);

    function revealOnScroll() {
        var scrolled = $window.scrollTop(),
            win_height_padded = $window.height() * 1.1;
        $('.revealOnScroll:not(.animated)').each(function() {
            var $this = $(this),
                offsetTop = $this.offset().top;
            if (scrolled + win_height_padded > offsetTop) {
                if ($this.data('timeout')) {
                    window.setTimeout(function() {
                        $this.addClass('animated ' + $this.data('animation'));
                    }, parseInt($this.data('timeout'), 10));
                } else {
                    $this.addClass('animated ' + $this.data('animation'));
                }
            }
        });

    }
});



// go-to

$(function() {

    $('.go-to').on('click tap', function(e) {
        // prevent normal scrolling action
        e.preventDefault();
        // grab the target url from the anchor's ``href``
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        if (target.length) {
            $('html,body').animate({
                scrollTop: target.offset().top
            }, 500);
            return false;
        }
    });
});


