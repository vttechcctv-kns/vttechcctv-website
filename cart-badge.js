
(function(){
  function updateCartCount(){
    try{
      var cart = JSON.parse(localStorage.getItem('vttech_cart_v1')||'{"items":[]}');
      var count = cart.items.reduce(function(s,i){return s + (i.qty||0)},0);
      var el = document.getElementById('cart-link');
      if(el) el.textContent = 'Giỏ hàng (' + count + ')';
    }catch(e){}
  }
  document.addEventListener('DOMContentLoaded', updateCartCount);
  window.updateCartCount = updateCartCount;
})();
