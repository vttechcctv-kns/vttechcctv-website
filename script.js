
function getCart(){
  return JSON.parse(localStorage.getItem("cart") || "[]");
}
function saveCart(cart){
  localStorage.setItem("cart", JSON.stringify(cart));
}
function addToCart(name, price){
  let cart = getCart();
  cart.push({name, price});
  saveCart(cart);
  alert("Đã thêm " + name + " vào giỏ hàng!");
  updateCartCount();
}
function updateCartCount(){
  let cart = getCart();
  let link = document.getElementById("cart-link");
  if(link) link.textContent = `Giỏ hàng (${cart.length})`;
}
window.onload = updateCartCount;
