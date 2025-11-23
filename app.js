/* VTTECH - external JS (app.js)
   Handles cart (localStorage), product add, cart page actions and checkout simulation.
   Cache-friendly: include a short version for production and use long cache-control on server.
*/
(function(){
  const CART_KEY = 'vttech_cart_v1';

  function formatVND(n){
    if(typeof n !== 'number') n = Number(n) || 0;
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + '₫';
  }

  function getCart(){
    try{
      return JSON.parse(localStorage.getItem(CART_KEY)) || {items:[]};
    }catch(e){ return {items:[]}; }
  }
  function saveCart(cart){
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }
  function updateCartCount(){
    const cart = getCart();
    const count = cart.items.reduce((s,i)=>s+i.qty,0);
    const el = document.getElementById('cart-link');
    if(el) el.textContent = `Giỏ hàng (${count})`;
  }

  function addItem(id, name, price, qty=1){
    const cart = getCart();
    const found = cart.items.find(i=>i.id===id);
    if(found) found.qty += qty;
    else cart.items.push({id,name,price,qty});
    saveCart(cart);
  }

  // wire up Add to cart buttons (on product lists)
  document.addEventListener('click', function(e){
    const btn = e.target.closest('.add-to-cart');
    if(!btn) return;
    const article = btn.closest('.product-card');
    if(!article) return;
    const id = article.getAttribute('data-id') || ('p-'+Date.now());
    const name = article.getAttribute('data-name') || article.querySelector('.product-title')?.textContent?.trim() || 'Sản phẩm';
    const price = Number(article.getAttribute('data-price') || 0);
    addItem(id, name, price, 1);

    // feedback
    const old = btn.textContent;
    btn.textContent = 'Đã thêm ✓';
    btn.disabled = true;
    setTimeout(()=>{ btn.textContent = old; btn.disabled = false; }, 900);
  });

  // If on cart.html provide functions to render and manage cart
  function renderCartPage(){
    if(!document.getElementById('cart-root')) return;
    const root = document.getElementById('cart-root');
    const cart = getCart();
    if(!cart.items || cart.items.length === 0){
      root.innerHTML = '<div class="card"><p>Giỏ hàng trống. <a href="index.html">Tiếp tục mua sắm</a></p></div>';
      return;
    }
    let html = '<div class="card"><table class="cart-table" aria-live="polite"><thead><tr><th>Sản phẩm</th><th>Đơn giá</th><th>Số lượng</th><th>Thành tiền</th><th></th></tr></thead><tbody>';
    cart.items.forEach((it, idx)=>{
      html += `<tr data-index="${idx}">
        <td>${escapeHtml(it.name)}</td>
        <td>${formatVND(it.price)}</td>
        <td><input class="qty-input" type="number" min="1" value="${it.qty}" data-idx="${idx}" /></td>
        <td class="row-total">${formatVND(it.price * it.qty)}</td>
        <td><button class="btn remove-item" data-idx="${idx}">Xóa</button></td>
      </tr>`;
    });
    html += `</tbody></table>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
        <div><strong>Tổng:</strong> <span id="cart-grand-total"></span></div>
        <div style="display:flex;gap:8px">
          <button id="checkout-paypal" class="btn">Checkout PayPal (mô phỏng)</button>
          <button id="checkout-cod" class="outline-btn">Thanh toán khi nhận (COD)</button>
        </div>
      </div>
    </div>`;
    root.innerHTML = html;
    updateTotals();
  }

  function updateTotals(){
    const cart = getCart();
    const grand = cart.items.reduce((s,i)=>s + (i.price * i.qty), 0);
    document.getElementById('cart-grand-total').textContent = formatVND(grand);
    // update each row total
    document.querySelectorAll('tr[data-index]').forEach(tr=>{
      const idx = Number(tr.getAttribute('data-index'));
      const item = cart.items[idx];
      const cell = tr.querySelector('.row-total');
      if(item && cell) cell.textContent = formatVND(item.price * item.qty);
    });
  }

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]; });
  }

  // events for cart page
  document.addEventListener('input', function(e){
    const q = e.target.closest('.qty-input');
    if(!q) return;
    const idx = Number(q.getAttribute('data-idx'));
    const val = Math.max(1, Number(q.value) || 1);
    const cart = getCart();
    if(cart.items[idx]){
      cart.items[idx].qty = val;
      saveCart(cart);
      // update row total
      renderCartPage();
    }
  });

  document.addEventListener('click', function(e){
    if(e.target.matches('.remove-item')){
      const idx = Number(e.target.getAttribute('data-idx'));
      const cart = getCart();
      cart.items.splice(idx,1);
      saveCart(cart);
      renderCartPage();
    }
    if(e.target.id === 'checkout-paypal' || e.target.id === 'checkout-cod'){
      const method = e.target.id === 'checkout-paypal' ? 'paypal' : 'cod';
      doCheckout(method);
    }
  });

  function doCheckout(method){
    const cart = getCart();
    if(!cart.items || cart.items.length === 0){ alert('Giỏ hàng trống'); return; }
    // Prepare order payload (in real app, send to server)
    const order = {
      id: 'ORD-' + Date.now(),
      created: new Date().toISOString(),
      items: cart.items,
      total: cart.items.reduce((s,i)=>s + i.price*i.qty,0),
      method
    };
    // Simulate different flows
    if(method === 'paypal'){
      // In real integration you'd redirect to PayPal checkout; here we simulate by opening a page with order summary
      const simulatedUrl = 'checkout_success.html?order=' + encodeURIComponent(JSON.stringify(order));
      // For demo open a new window with JSON (or could show modal)
      window.open(simulatedUrl, '_blank');
      // Clear cart
      localStorage.removeItem(CART_KEY);
      updateCartCount();
      renderCartPage();
      alert('Mô phỏng: chuyển tới PayPal (mở tab mới). Đơn hàng đã được tạo: ' + order.id);
    } else {
      // COD: show confirmation and create mock order email (display)
      localStorage.removeItem(CART_KEY);
      updateCartCount();
      renderCartPage();
      // create mailto with order summary (mock)
      const subject = encodeURIComponent('Đơn hàng ' + order.id + ' - VTTECH (COD)');
      let body = 'Cám ơn bạn đã đặt hàng tại VTTECH!\n\n';
      body += 'Mã đơn: ' + order.id + '\n';
      body += 'Thời gian: ' + order.created + '\n';
      body += 'Phương thức: Thanh toán khi nhận (COD)\n\n';
      body += 'Chi tiết sản phẩm:\n';
      order.items.forEach(it => {
        body += '- ' + it.name + ' x' + it.qty + ' — ' + formatVND(it.price * it.qty) + '\n';
      });
      body += '\nTổng: ' + formatVND(order.total) + '\n\nVTTECH sẽ liên hệ xác nhận trong vài phút.';
      window.location.href = 'mailto:vttechcctv@gmail.com?subject=' + subject + '&body=' + encodeURIComponent(body);
    }
  }

  // On load actions
  document.addEventListener('DOMContentLoaded', function(){
    updateCartCount();
    renderCartPage();
  });

})();
