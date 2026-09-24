const DB_KEY="vijay_tailors_db_v3";
const defaultDB={settings:{businessName:"VIJAY TAILOR'S",ownerName:"",phone:"",whatsapp:"",address:"",gstin:"",tagline:"MEN'S SPECIALIST"},products:[{id:"p1",name:"Shirt",price:349},{id:"p2",name:"Pant",price:349},{id:"p3",name:"School Uniform",price:699},{id:"p4",name:"Office Uniform",price:699},{id:"p5",name:"Kurta Pajama",price:699}],customers:[],orders:[]};
let db=JSON.parse(localStorage.getItem(DB_KEY)||JSON.stringify(defaultDB)),currentCustomerId=null,currentOrderId=null;
const $=id=>document.getElementById(id),money=n=>"₹"+Number(n||0).toLocaleString("en-IN"),uid=p=>p+"_"+Date.now()+"_"+Math.random().toString(36).slice(2,7);
function saveDB(){localStorage.setItem(DB_KEY,JSON.stringify(db))}
function toast(msg){let x=$("toast");if(!x){x=document.createElement("div");x.id="toast";document.body.appendChild(x)}x.innerHTML=`<i data-lucide="check-circle"></i><span>${msg}</span>`;if(window.lucide)lucide.createIcons();x.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>x.classList.remove("show"),2500)}
function showPage(page){
document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));let p=$("page-"+page);if(p)p.classList.add("active");
document.querySelectorAll("[data-page]").forEach(x=>x.classList.toggle("active",x.dataset.page===page));
let titles={"dashboard":["Dashboard","Business overview and today's activity"],"orders":["Orders","Track all tailoring orders"],"customers":["Customers","Customer details and order history"],"products":["Products & Pricing","Manage your products and prices"],"reports":["Reports","Sales and business overview"],"settings":["Settings","Business information and preferences"],"new-order":["New Order","Create a new tailoring order"]};
if(titles[page]){$("page-title").textContent=titles[page][0];$("page-subtitle").textContent=titles[page][1]}
if(page==="dashboard")renderDashboard();if(page==="orders")renderOrders();if(page==="customers")renderCustomers();if(page==="products")renderProducts();if(page==="reports")renderReports();if(page==="settings")loadSettings();if(page==="new-order")prepareNewOrder();
}
function nav(page){showPage(page);document.querySelector(".sidebar")?.classList.remove("open")}
function openNewOrder(customerId=""){currentCustomerId=customerId;showPage("new-order")}
function today(){return new Date().toISOString().slice(0,10)}
function formatDate(d){if(!d)return"-";let x=new Date(d);return x.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}
function escapeHTML(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function customerName(id){let c=db.customers.find(x=>x.id===id);return c?c.name:"Unknown Customer"}
function productName(id){let p=db.products.find(x=>x.id===id);return p?p.name:"Product"}
function statusText(s){return{snew:"New",new:"New",progress:"In Progress",ready:"Ready",collected:"Collected"}[s]||s}
function statusClass(s){return s==="new"?"new":s==="progress"?"progress":s==="ready"?"ready":"collected"}
function renderDashboard(){
let orders=db.orders,sales=orders.filter(o=>o.date?.slice(0,10)===today()).reduce((a,o)=>a+Number(o.advance||0),0),pending=orders.reduce((a,o)=>a+Number(o.balance||0),0),ready=orders.filter(o=>o.status==="ready").length;
$("dash-sales").textContent=money(sales);$("dash-orders").textContent=orders.length;$("dash-pending").textContent=money(pending);$("dash-ready").textContent=String(ready).padStart(2,"0");
let recent=orders.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5),box=$("recent-orders");
if(!box)return;
box.innerHTML=recent.length?recent.map(o=>`<div class="order-row"><div><strong>${escapeHTML(customerName(o.customerId))}</strong><small>${escapeHTML(productName(o.productId))} × ${o.qty} · ${formatDate(o.date)}</small></div><div><strong>${money(o.total)}</strong><span class="status ${statusClass(o.status)}">${statusText(o.status)}</span></div></div>`).join(""):`<div class="empty">No orders yet</div>`;
}
function renderOrders(){
let box=$("orders-list");if(!box)return;let q=($("order-search")?.value||"").toLowerCase(),orders=db.orders.filter(o=>customerName(o.customerId).toLowerCase().includes(q)||productName(o.productId).toLowerCase().includes(q)).sort((a,b)=>new Date(b.date)-new Date(a.date));
box.innerHTML=orders.length?orders.map(o=>`<div class="order-card"><div class="order-main"><div class="order-icon"><i data-lucide="scissors"></i></div><div class="order-info"><h3>${escapeHTML(customerName(o.customerId))}</h3><p>${escapeHTML(productName(o.productId))} × ${o.qty}</p><small>${formatDate(o.date)} · Delivery ${formatDate(o.deliveryDate)}</small></div></div><div class="order-side"><strong>${money(o.total)}</strong><span class="status ${statusClass(o.status)}">${statusText(o.status)}</span><small>Balance ${money(o.balance)}</small><button class="icon-btn" onclick="openCustomerDetails('${o.customerId}')"><i data-lucide="arrow-right"></i></button></div></div>`).join(""):`<div class="empty">No orders found</div>`;if(window.lucide)lucide.createIcons();
}
function renderCustomers(){
let box=$("customers-list");if(!box)return;let q=($("customer-search")?.value||"").toLowerCase(),cs=db.customers.filter(c=>c.name.toLowerCase().includes(q)||String(c.phone||"").includes(q));
box.innerHTML=cs.length?cs.map(c=>{let os=db.orders.filter(o=>o.customerId===c.id),pending=os.reduce((a,o)=>a+Number(o.balance||0),0);return`<div class="customer-card" onclick="openCustomerDetails('${c.id}')"><div class="avatar">${escapeHTML((c.name||"?").charAt(0).toUpperCase())}</div><div class="customer-info"><h3>${escapeHTML(c.name)}</h3><p>${escapeHTML(c.phone||"No phone")}</p><small>${os.length} order${os.length!==1?"s":""}</small></div><div class="customer-balance">${pending?`<strong>${money(pending)}</strong><small>Pending</small>`:"<small>Paid</small>"}<i data-lucide="chevron-right"></i></div></div>`}).join(""):`<div class="empty">No customers found</div>`;if(window.lucide)lucide.createIcons();
}
function renderProducts(){
let box=$("products-list");if(!box)return;
box.innerHTML=db.products.map(p=>`<div class="product-card"><div class="product-icon"><i data-lucide="shirt"></i></div><div class="product-info"><h3>${escapeHTML(p.name)}</h3><strong>${money(p.price)}</strong></div><button class="icon-btn" onclick="editProduct('${p.id}')"><i data-lucide="pencil"></i></button><button class="icon-btn danger" onclick="deleteProduct('${p.id}')"><i data-lucide="trash-2"></i></button></div>`).join("")||`<div class="empty">No products</div>`;if(window.lucide)lucide.createIcons();
}
function addProduct(){let name=prompt("Product name");if(!name)return;let price=Number(prompt("Price","0"));if(!price)return;db.products.push({id:uid("p"),name:name.trim(),price});saveDB();renderProducts();toast("Product added")}
function editProduct(id){let p=db.products.find(x=>x.id===id);if(!p)return;let name=prompt("Product name",p.name);if(!name)return;let price=Number(prompt("Price",p.price));if(!price)return;p.name=name.trim();p.price=price;saveDB();renderProducts();toast("Product updated")}
function deleteProduct(id){let p=db.products.find(x=>x.id===id);if(!p)return;if(!confirm(`Delete ${p.name}?`))return;db.products=db.products.filter(x=>x.id!==id);saveDB();renderProducts();toast("Product deleted")}
function prepareNewOrder(){
let s=$("order-product");if(!s)return;s.innerHTML=`<option value="">Select product</option>`+db.products.map(p=>`<option value="${p.id}">${escapeHTML(p.name)} — ${money(p.price)}</option>`).join("");
let c=$("order-customer");if(c)c.value=currentCustomerId||"";
let customer=currentCustomerId?db.customers.find(x=>x.id===currentCustomerId):null;
if(customer){$("customer-name").value=customer.name||"";$("customer-phone").value=customer.phone||"";$("customer-address").value=customer.address||""}
let d=$("delivery-date");if(d&&!d.value){let x=new Date();x.setDate(x.getDate()+7);d.value=x.toISOString().slice(0,10)}
calculateOrder();
}
function calculateOrder(){
let p=db.products.find(x=>x.id===$("order-product")?.value),qty=Number($("order-qty")?.value||1),advance=Number($("order-advance")?.value||0),total=(p?p.price:0)*qty,balance=Math.max(0,total-advance);
if($("order-total"))$("order-total").textContent=money(total);if($("order-balance"))$("order-balance").textContent=money(balance);if($("bill-total"))$("bill-total").textContent=money(total);if($("bill-advance"))$("bill-advance").textContent=money(advance);if($("bill-balance"))$("bill-balance").textContent=money(balance);
return{p,qty,advance,total,balance};
}
function addPhoto(input){
let file=input.files?.[0];if(!file)return;let r=new FileReader();r.onload=()=>{let img=$("photo-preview");if(img){img.src=r.result;img.style.display="block"}$("order-photo-data").value=r.result};r.readAsDataURL(file)
}
function saveOrder(){
let name=$("customer-name")?.value.trim(),phone=$("customer-phone")?.value.trim(),address=$("customer-address")?.value.trim(),instruction=$("special-instruction")?.value.trim(),delivery=$("delivery-date")?.value,{p,qty,advance,total,balance}=calculateOrder();
if(!name)return toast("Enter customer name");if(!p)return toast("Select a product");if(!phone)return toast("Enter customer phone");if(advance>total)return toast("Advance cannot exceed total");
let c=db.customers.find(x=>x.id===currentCustomerId)||db.customers.find(x=>x.phone===phone);
if(!c){c={id:uid("c"),name,phone,address,measurements:{},createdAt:new Date().toISOString()};db.customers.push(c)}else{c.name=name;c.phone=phone;c.address=address}
let photos=[],$photo=$("order-photo-data");if($photo?.value)photos.push({data:$photo.value,date:new Date().toISOString()});
let o={id:uid("o"),customerId:c.id,productId:p.id,qty,total,advance,balance,status:"new",date:new Date().toISOString(),deliveryDate:delivery||"",instruction,photos};db.orders.push(o);currentCustomerId=c.id;currentOrderId=o.id;saveDB();toast("Order saved successfully");openCustomerDetails(c.id)
}
function openCustomerDetails(id){
let c=db.customers.find(x=>x.id===id);if(!c)return;currentCustomerId=id;let orders=db.orders.filter(o=>o.customerId===id).sort((a,b)=>new Date(b.date)-new Date(a.date));
$("customer-detail-name").textContent=c.name;$("customer-detail-phone").textContent=c.phone||"No phone";$("customer-detail-address").textContent=c.address||"";
let total=orders.reduce((a,o)=>a+o.total,0),paid=orders.reduce((a,o)=>a+Number(o.advance||0),0),bal=orders.reduce((a,o)=>a+Number(o.balance||0),0);
$("customer-detail-stats").innerHTML=`<div><small>Total Orders</small><strong>${orders.length}</strong></div><div><small>Total Sales</small><strong>${money(total)}</strong></div><div><small>Paid</small><strong>${money(paid)}</strong></div><div><small>Balance</small><strong>${money(bal)}</strong></div>`;
let mb=$("measurement-fields");if(mb){let m=c.measurements||{};mb.innerHTML=["neck","chest","waist","shoulder","sleeve","length"].map(k=>`<label>${k[0].toUpperCase()+k.slice(1)}<input id="m-${k}" value="${escapeHTML(m[k]||"")}"></label>`).join("")}
let ob=$("customer-orders");if(ob)ob.innerHTML=orders.length?orders.map(o=>`<div class="detail-order"><div><h4>${escapeHTML(productName(o.productId))} × ${o.qty}</h4><small>Order: ${formatDate(o.date)} · Delivery: ${formatDate(o.deliveryDate)}</small>${o.instruction?`<p><strong>Instruction:</strong> ${escapeHTML(o.instruction)}</p>`:""}<span class="status ${statusClass(o.status)}">${statusText(o.status)}</span></div><div class="detail-actions"><strong>${money(o.total)}</strong><small>Balance ${money(o.balance)}</small>${o.photos?.length?`<div class="order-photos">${o.photos.map(ph=>`<div><img src="${ph.data}"><small>${formatDate(ph.date)}</small></div>`).join("")}</div>`:""}<button onclick="advanceStatus('${o.id}')">${o.status==="new"?"Start Order":o.status==="progress"?"Mark Ready":o.status==="ready"?"Order is Collected":"Collected"}</button><button onclick="generateBill('${o.id}')"><i data-lucide="file-text"></i> Bill</button>${o.status==="ready"?`<button onclick="sendReadyMessage('${o.id}')"><i data-lucide="message-circle"></i> WhatsApp Ready</button>`:""}</div></div>`).join(""):`<div class="empty">No orders yet</div>`;
showModal("customer-modal");if(window.lucide)lucide.createIcons()
}
function saveMeasurements(){
let c=db.customers.find(x=>x.id===currentCustomerId);if(!c)return;c.measurements={neck:$("m-neck")?.value||"",chest:$("m-chest")?.value||"",waist:$("m-waist")?.value||"",shoulder:$("m-shoulder")?.value||"",sleeve:$("m-sleeve")?.value||"",length:$("m-length")?.value||""};saveDB();toast("Measurements saved")
}
function advanceStatus(id){
let o=db.orders.find(x=>x.id===id);if(!o)return;
if(o.status==="new")o.status="progress";
else if(o.status==="progress"){o.status="ready";sendReadyMessage(id)}
else if(o.status==="ready"){o.status="collected";o.advance=o.total;o.balance=0;sendCollectedMessage(id)}
saveDB();toast(o.status==="collected"?"Order collected — payment completed":"Order status updated");openCustomerDetails(o.customerId);renderDashboard();renderOrders()
}
function waNumber(n){n=String(n||"").replace(/\D/g,"");if(n.length===10)n="91"+n;return n}
function openWhatsApp(phone,msg){let n=waNumber(phone);if(!n)return toast("Customer phone missing");window.open(`https://wa.me/${n}?text=${encodeURIComponent(msg)}`,"_blank")}
function sendReadyMessage(id){
let o=db.orders.find(x=>x.id===id),c=o&&db.customers.find(x=>x.id===o.customerId);if(!o||!c)return;openWhatsApp(c.phone,`Hello ${c.name}, your order from ${db.settings.businessName} is ready. Please visit the shop and collect your order. Thank you!`)
}
function sendCollectedMessage(id){
let o=db.orders.find(x=>x.id===id),c=o&&db.customers.find(x=>x.id===o.customerId);if(!o||!c)return;openWhatsApp(c.phone,`Hello ${c.name}, your order has been collected successfully from ${db.settings.businessName}. Thank you for visiting us!`)
}
function generateBill(id){
let o=db.orders.find(x=>x.id===id),c=o&&db.customers.find(x=>x.id===o.customerId);if(!o||!c)return;
if(!window.jspdf)return toast("PDF library not loaded");
let{jsPDF}=window.jspdf,doc=new jsPDF(),s=db.settings;
doc.setFontSize(20);doc.text(s.businessName||"VIJAY TAILOR'S",20,25);doc.setFontSize(11);doc.text(s.tagline||"MEN'S SPECIALIST",20,33);doc.line(20,40,190,40);doc.setFontSize(12);doc.text(`Bill No: ${o.id.slice(-8).toUpperCase()}`,20,52);doc.text(`Date: ${formatDate(o.date)}`,20,60);doc.text(`Customer: ${c.name}`,20,72);doc.text(`Phone: ${c.phone||"-"}`,20,80);doc.text(`Product: ${productName(o.productId)}`,20,94);doc.text(`Quantity: ${o.qty}`,20,102);doc.text(`Total: ${money(o.total)}`,20,114);doc.text(`Advance/Paid: ${money(o.advance)}`,20,122);doc.text(`Balance: ${money(o.balance)}`,20,130);if(o.instruction){doc.text("Special Instruction:",20,145);doc.text(String(o.instruction).slice(0,90),20,153)}doc.line(20,170,190,170);doc.text("Thank you for choosing us!",20,182);if(s.phone)doc.text(`Contact: ${s.phone}`,20,190);doc.save(`Vijay-Tailors-Bill-${o.id.slice(-8)}.pdf`);toast("Bill PDF generated")
}
function renderReports(){
let os=db.orders,total=os.reduce((a,o)=>a+Number(o.total||0),0),paid=os.reduce((a,o)=>a+Number(o.advance||0),0),balance=os.reduce((a,o)=>a+Number(o.balance||0),0);
$("report-total-sales").textContent=money(total);$("report-paid").textContent=money(paid);$("report-balance").textContent=money(balance);$("report-orders").textContent=os.length;
}
function loadSettings(){
let s=db.settings;["business-name","owner-name","business-phone","business-whatsapp","business-address","business-gstin","business-tagline"].forEach(id=>{let e=$(id);if(e)e.value=s[id.replace("business-","")||""]});
if($("business-name"))$("business-name").value=s.businessName||"";if($("owner-name"))$("owner-name").value=s.ownerName||"";if($("business-phone"))$("business-phone").value=s.phone||"";if($("business-whatsapp"))$("business-whatsapp").value=s.whatsapp||"";if($("business-address"))$("business-address").value=s.address||"";if($("business-gstin"))$("business-gstin").value=s.gstin||"";if($("business-tagline"))$("business-tagline").value=s.tagline||"";
}
function saveSettings(){
db.settings={businessName:$("business-name")?.value.trim()||"VIJAY TAILOR'S",ownerName:$("owner-name")?.value.trim()||"",phone:$("business-phone")?.value.trim()||"",whatsapp:$("business-whatsapp")?.value.trim()||"",address:$("business-address")?.value.trim()||"",gstin:$("business-gstin")?.value.trim()||"",tagline:$("business-tagline")?.value.trim()||"MEN'S SPECIALIST"};saveDB();$("business-name-display").textContent=db.settings.businessName;toast("Settings saved")
}
function showModal(id){let e=$(id);if(e)e.classList.add("show")}
function closeModal(id){let e=$(id);if(e)e.classList.remove("show")}
function newCustomer(){currentCustomerId=null;openNewOrder("")}
document.addEventListener("input",e=>{if(["order-product","order-qty","order-advance"].includes(e.target.id))calculateOrder();if(e.target.id==="order-search")renderOrders();if(e.target.id==="customer-search")renderCustomers()});
document.addEventListener("DOMContentLoaded",()=>{
if($("business-name-display"))$("business-name-display").textContent=db.settings.businessName;
document.querySelectorAll("[data-page]").forEach(e=>e.addEventListener("click",()=>nav(e.dataset.page)));
showPage("dashboard");if(window.lucide)lucide.createIcons()
});
window.nav=nav;window.showPage=showPage;window.openNewOrder=openNewOrder;window.saveOrder=saveOrder;window.calculateOrder=calculateOrder;window.addPhoto=addPhoto;window.openCustomerDetails=openCustomerDetails;window.saveMeasurements=saveMeasurements;window.advanceStatus=advanceStatus;window.generateBill=generateBill;window.sendReadyMessage=sendReadyMessage;window.sendCollectedMessage=sendCollectedMessage;window.addProduct=addProduct;window.editProduct=editProduct;window.deleteProduct=deleteProduct;window.saveSettings=saveSettings;window.closeModal=closeModal;window.newCustomer=newCustomer;
