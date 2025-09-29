// script.js - simple product list + cart using localStorage and mailto checkout
const products = [
  { id: 1, name: 'Camera IP HIK 4MP Full Color', price: 2200000, desc: 'Độ phân giải 4MP, hồng ngoại, chống nước IP66' },
  { id: 2, name: 'Camera Dome 2MP', price: 950000, desc: 'Thiết kế nhỏ gọn, lắp trong nhà/ngoài trời' },
  { id: 3, name: 'Đầu ghi NVR 8 kênh 4K', price: 4200000, desc: 'Hỗ trợ 8 camera, xem từ xa qua app' },
  { id: 4, name: 'Ổ cứng HDD 2TB cho NVR', price: 1500000, desc: 'Tối ưu lưu trữ camera, độ bền cao' },
  { id: 5, name: 'Adapter 12V 2A', price: 120000, desc: 'Nguồn ổn định cho camera' },
  { id: 6, name: 'Camera IP HIK 2MP Full Color', price: 1400000, desc: 'Độ phân giải 2MP, hồng ngoại, chống nước IP66' },
  { id: 7, name: 'Camera Dome 4MP', price: 1950000, desc: 'Thiết kế nhỏ gọn, lắp trong nhà/ngoài trời' },
  { id: 8, name: 'Đầu ghi NVR 16 kênh 4K', price: 6200000, desc: 'Hỗ trợ 16 camera, xem từ xa qua app' },
  { id: 9, name: 'Ổ cứng HDD 6TB cho NVR', price: 4500000, desc: 'Tối ưu lưu trữ camera, độ bền cao' },
  { id: 10, name: 'Adapter 12V 20A', price: 420000, desc: 'Nguồn ổn định cho camera' },
 ];

function formatVND(n){ return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '₫' }

function renderProducts(){
  const grid = document.getElementById('products-grid');
  grid.innerHTML = '';
  products.forEach(p=>{
    const card = document.createElement('div'); card.className='card';
    const img = document.createElement('img');
    // simple SVG placeholder with product name
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="100%" height="100%" fill="#eef6ff"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="32" fill="#0b6ef6">${p.name}</text></svg>`;
    img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    const h4 = document.createElement('h4'); h4.textContent = p.name;
    const desc = document.createElement('div'); desc.className='small meta'; desc.textContent = p.desc;
    const price = document.createElement('div'); price.className='price'; price.textContent = formatVND(p.price);
    const btn = document.createElement('button'); btn.className='btn'; btn.textContent='Thêm vào giỏ';
    btn.onclick = ()=> addToCart(p.id);
    card.append(img,h4,desc,price,btn);
    grid.appendChild(card);
  });
}

let cart = JSON.parse(localStorage.getItem('cctv_cart')||'[]');

function saveCart(){ localStorage.setItem('cctv_cart', JSON.stringify(cart)); updateCartCount(); }

function updateCartCount(){ document.getElementById('cart-count').textContent = cart.reduce((s,i)=>s+i.qty,0); }

function addToCart(id){
  const item = cart.find(x=>x.id===id);
  if(item) item.qty++;
  else cart.push({id,qty:1});
  saveCart();
  alert('Đã thêm vào giỏ hàng');
}

function openCart(){
  document.getElementById('cart-modal').classList.remove('hidden');
  renderCartItems();
}

function closeCart(){ document.getElementById('cart-modal').classList.add('hidden'); }

function renderCartItems(){
  const el = document.getElementById('cart-items'); el.innerHTML = '';
  if(cart.length===0){ el.innerHTML = '<p>Giỏ hàng trống</p>'; document.getElementById('cart-total').textContent='0₫'; return; }
  let total=0;
  cart.forEach(ci=>{
    const p = products.find(x=>x.id===ci.id);
    const row = document.createElement('div'); row.className='cart-item';
    const img = document.createElement('img');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="100%" height="100%" fill="#eef6ff"/></svg>`;
    img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    const info = document.createElement('div'); info.style.flex='1';
    info.innerHTML = `<div><strong>${p.name}</strong></div><div class="small">${formatVND(p.price)}</div>`;
    const qty = document.createElement('div'); qty.className='cart-qty';
    const minus = document.createElement('button'); minus.textContent='−'; minus.onclick=()=>{ changeQty(ci.id, -1) };
    const plus = document.createElement('button'); plus.textContent='+'; plus.onclick=()=>{ changeQty(ci.id, +1) };
    const qspan = document.createElement('span'); qspan.textContent = ci.qty;
    qty.append(minus,qspan,plus);
    const sub = document.createElement('div'); sub.textContent = formatVND(p.price * ci.qty);
    row.append(img,info,qty,sub);
    el.appendChild(row);
    total += p.price * ci.qty;
  });
  document.getElementById('cart-total').textContent = formatVND(total);
}

function changeQty(id, delta){
  const it = cart.find(x=>x.id===id);
  if(!it) return;
  it.qty += delta;
  if(it.qty<=0) cart = cart.filter(x=>x.id!==id);
  saveCart();
  renderCartItems();
}

function checkout(){
  if(cart.length===0){ alert('Giỏ hàng rỗng'); return; }
  // create order summary and open mailto
  let total=0;
  let body = 'Đơn hàng từ CCTV Shop%0A%0A';
  cart.forEach(ci=>{
    const p = products.find(x=>x.id===ci.id);
    body += `${p.name} x${ci.qty} - ${p.price.toLocaleString()}₫%0A`;
    total += p.price * ci.qty;
  });
  body += `%0ATổng: ${total.toLocaleString()}₫%0A%0AThông tin khách hàng:%0ATên:%0AĐT:%0AĐịa chỉ:%0A`;
  const mailto = `mailto:vttechcctv@gmail.com?subject=Đơn%20hàng%20CCTV&body=${body}`;
  window.location.href = mailto;
}

document.getElementById('cart-btn').addEventListener('click', openCart);
document.getElementById('close-cart').addEventListener('click', closeCart);
document.getElementById('checkout').addEventListener('click', checkout);

renderProducts();
updateCartCount();
