const KEY="vijay_tailors_v1";
let db=JSON.parse(localStorage.getItem(KEY)||"null")||{
settings:{name:"VIJAY TAILOR'S",tagline:"MEN'S SPECIALIST",phone:"",whatsapp:"",address:""},
products:[
{id:"p1",name:"Shirt",price:349},
{id:"p2",name:"Pant",price:349},
{id:"p3",name:"School Uniform",price:699},
{id:"p4",name:"Office Uniform",price:699},
{id:"p5",name:"Kurta Pajama",price:699},
{id:"p6",name:"Alteration",price:0}
],
customers:[],
orders:[]
};
let currentPage="dashboard";
let orderItems=[];
let clothPhoto="";
let toastTimer;

function saveDB(){localStorage.setItem(KEY,JSON.stringify(db))}
function money(n){return "₹"+Number(n||0).toLocaleString("en-IN")}
function uid(prefix){return prefix+"_"+Date.now()+"_"+Math.random().toString(36).slice(2,7)}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function toast(msg){clearTimeout(toastTimer);let e=document.getElementById("toast");e.textContent=msg;e.classList.add("show");toastTimer=setTimeout(()=>e.classList.remove("show"),2500)}
function openModal(id){document.getElementById(id).classList.add("open");lucide.createIcons()}
function closeModal(id){document.getElementById(id).classList.remove("open")}
function showPage(page){
currentPage=page;
document.querySelectorAll(".page").forEach(x=>x.classList.toggle("active",x.id===page));
document.querySelectorAll("[data-page]").forEach(x=>x.classList.toggle("active",x.dataset.page===page));
const titles={dashboard:["Dashboard","Business overview"],orders:["Orders","Manage all customer orders"],customers:["Customers","Customer records and history"],products:["Products","Products & pricing"],reports:["Reports","Business performance"],settings:["Settings","Business configuration"]};
document.getElementById("pageTitle").textContent=titles[page][0];
document.getElementById("pageSubtitle").textContent=titles[page][1];
if(page==="dashboard")renderDashboard();
if(page==="orders")renderOrders();
if(page==="customers")renderCustomers();
if(page==="products")renderProducts();
if(page==="reports")renderReports();
if(page==="settings")loadSettings();
lucide.createIcons();
}
document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
document.getElementById("newOrderBtn").onclick=openNewOrder;
document.getElementById("menuBtn").onclick=()=>showPage("dashboard");

function renderDashboard(){
let today=new Date().toISOString().slice(0,10);
let todayOrders=db.orders.filter(o=>o.created.slice(0,10)===today);
let sales=todayOrders.reduce((a,o)=>a+o.total,0);
let due=db.orders.reduce((a,o)=>a+o.balance,0);
document.getElementById("todaySales").textContent=money(sales);
document.getElementById("todayOrders").textContent=todayOrders.length+" orders";
document.getElementById("totalOrders").textContent=db.orders.length;
document.getElementById("balanceDue").textContent=money(due);
document.getElementById("readyOrders").textContent=db.orders.filter(o=>o.status==="ready").length;
let statuses=[["new","New","#4f70c9"],["progress","In Progress","#b37b20"],["ready","Ready","#198754"],["collected","Collected","#777"]];
document.getElementById("statusOverview").innerHTML=statuses.map(s=>`<div class="status-row"><div><span class="status-dot" style="background:${s[2]}"></span>${s[1]}</div><strong>${db.orders.filter(o=>o.status===s[0]).length}</strong></div>`).join("");
let recent=[...db.orders].sort((a,b)=>b.created.localeCompare(a.created)).slice(0,6);
document.getElementById("recentOrders").innerHTML=recent.length?recent.map(orderRowHTML).join(""):`<div class="empty">No orders yet. Create your first order.</div>`;
lucide.createIcons()
}

function statusLabel(s){return{snew:"New",new:"New",progress:"In Progress",ready:"Ready",collected:"Collected"}[s]||s}
function orderRowHTML(o){
return `<div class="order-row">
<div class="order-main"><strong>${esc(o.customerName)}</strong><span>${esc(o.id)} • ${new Date(o.created).toLocaleDateString("en-IN")}</span></div>
<div class="order-meta">${esc(o.items.map(x=>x.name+" × "+x.qty).join(", "))}</div>
<div class="amount">${money(o.total)}</div>
<div><span class="badge ${o.status}">${statusLabel(o.status)}</span></div>
<button class="icon-btn" onclick="openOrderDetails('${o.id}')"><i data-lucide="chevron-right"></i></button>
</div>`
}

function renderOrders(){
let q=(document.getElementById("orderSearch").value||"").toLowerCase();
let f=document.getElementById("orderFilter").value;
let list=db.orders.filter(o=>(f==="all"||o.status===f)&&((o.customerName+" "+o.id+" "+o.phone).toLowerCase().includes(q))).sort((a,b)=>b.created.localeCompare(a.created));
document.getElementById("ordersList").innerHTML=list.length?list.map(orderRowHTML).join(""):`<div class="empty">No matching orders.</div>`;
lucide.createIcons()
}
document.getElementById("orderSearch").oninput=renderOrders;
document.getElementById("orderFilter").onchange=renderOrders;

function renderCustomers(){
let q=(document.getElementById("customerSearch").value||"").toLowerCase();
let list=db.customers.filter(c=>(c.name+" "+c.phone).toLowerCase().includes(q));
document.getElementById("customersGrid").innerHTML=list.length?list.map(c=>{
let orders=db.orders.filter(o=>o.customerId===c.id);
let initials=c.name.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase();
return `<div class="customer-card">
<div class="avatar">${esc(initials)}</div>
<h3>${esc(c.name)}</h3><p>${esc(c.phone)}</p>
<div class="customer-bottom"><span>${orders.length} order${orders.length===1?"":"s"}</span><button onclick="openCustomerDetails('${c.id}')">View Details</button></div>
</div>`}).join(""):`<div class="empty">No customers yet.</div>`;
}
document.getElementById("customerSearch").oninput=renderCustomers;

function renderProducts(){
document.getElementById("productsList").innerHTML=db.products.length?db.products.map(p=>`<div class="product-row">
<div><strong>${esc(p.name)}</strong></div>
<div class="product-price">${p.price?money(p.price):"Custom Price"}</div>
<div class="product-actions">
<button onclick="editProduct('${p.id}')" title="Edit"><i data-lucide="pencil"></i></button>
<button onclick="deleteProduct('${p.id}')" title="Delete"><i data-lucide="trash-2"></i></button>
</div>
</div>`).join(""):`<div class="empty">No products added.</div>`;
lucide.createIcons()
}
function openProductModal(id=""){
document.getElementById("editProductId").value=id;
document.getElementById("productModalTitle").textContent=id?"Edit Product":"Add Product";
if(id){let p=db.products.find(x=>x.id===id);document.getElementById("productName").value=p.name;document.getElementById("productPrice").value=p.price}
else{document.getElementById("productForm").reset()}
openModal("productModal")
}
function editProduct(id){openProductModal(id)}
function deleteProduct(id){
let p=db.products.find(x=>x.id===id);
if(!confirm(`Delete "${p.name}"?`))return;
db.products=db.products.filter(x=>x.id!==id);saveDB();renderProducts();toast("Product deleted")
}
document.getElementById("productForm").onsubmit=e=>{
e.preventDefault();
let id=document.getElementById("editProductId").value;
let name=document.getElementById("productName").value.trim();
let price=Number(document.getElementById("productPrice").value);
if(id){let p=db.products.find(x=>x.id===id);p.name=name;p.price=price;toast("Product updated")}
else{db.products.push({id:uid("p"),name,price});toast("Product added")}
saveDB();closeModal("productModal");renderProducts()
};

function openNewOrder(){
orderItems=[];clothPhoto="";
document.getElementById("orderForm").reset();
document.getElementById("orderQty").value=1;
document.getElementById("advance").value=0;
document.getElementById("photoPreview").innerHTML='<i data-lucide="camera"></i><span>No photo selected</span>';
fillProductSelect();renderOrderItems();updateBill();
openModal("orderModal");lucide.createIcons()
}
function fillProductSelect(){
let s=document.getElementById("orderProduct");
s.innerHTML=db.products.map(p=>`<option value="${p.id}">${esc(p.name)} — ${p.price?money(p.price):"Custom"}</option>`).join("");
let p=db.products[0];if(p)document.getElementById("orderPrice").value=p.price||""
}
document.getElementById("orderProduct").onchange=()=>{
let p=db.products.find(x=>x.id===document.getElementById("orderProduct").value);document.getElementById("orderPrice").value=p?.price||""
}
function addOrderItem(){
let p=db.products.find(x=>x.id===document.getElementById("orderProduct").value);
if(!p)return;
let qty=Math.max(1,Number(document.getElementById("orderQty").value)||1);
let price=Number(document.getElementById("orderPrice").value)||0;
orderItems.push({productId:p.id,name:p.name,qty,price,total:qty*price});
renderOrderItems();updateBill()
}
function renderOrderItems(){
document.getElementById("orderItems").innerHTML=orderItems.map((x,i)=>`<div class="item-line"><span>${esc(x.name)} × ${x.qty}</span><strong>${money(x.total)}</strong><button type="button" onclick="removeOrderItem(${i})"><i data-lucide="x"></i></button></div>`).join("");
lucide.createIcons()
}
function removeOrderItem(i){orderItems.splice(i,1);renderOrderItems();updateBill()}
function updateBill(){
let total=orderItems.reduce((a,x)=>a+x.total,0);
let adv=Math.min(total,Math.max(0,Number(document.getElementById("advance").value)||0));
let balance=total-adv;
document.getElementById("orderTotal").textContent=money(total);
document.getElementById("orderAdvance").textContent=money(adv);
document.getElementById("orderBalance").textContent=money(balance)
}
document.getElementById("advance").oninput=updateBill;

document.getElementById("clothPhoto").onchange=e=>{
let file=e.target.files[0];if(!file)return;
let reader=new FileReader();
reader.onload=ev=>{
clothPhoto=ev.target.result;
document.getElementById("photoPreview").innerHTML=`<img src="${clothPhoto}">`;
};
reader.readAsDataURL(file)
};
function removePhoto(){clothPhoto="";document.getElementById("clothPhoto").value="";document.getElementById("photoPreview").innerHTML='<i data-lucide="camera"></i><span>No photo selected</span>';lucide.createIcons()}

document.getElementById("orderForm").onsubmit=e=>{
e.preventDefault();
if(!orderItems.length){toast("Add at least one product");return}
let name=document.getElementById("customerName").value.trim();
let phone=document.getElementById("customerPhone").value.trim();
let existing=db.customers.find(c=>c.phone===phone);
let customerId=existing?.id||uid("c");
if(!existing)db.customers.push({id:customerId,name,phone,created:new Date().toISOString()});
else existing.name=name;
let total=orderItems.reduce((a,x)=>a+x.total,0);
let advance=Math.min(total,Math.max(0,Number(document.getElementById("advance").value)||0));
let order={
id:"VT-"+String(db.orders.length+1).padStart(4,"0"),
customerId,customerName:name,phone,
items:[...orderItems],total,advance,balance:total-advance,
deliveryDate:document.getElementById("deliveryDate").value,
instructions:document.getElementById("instructions").value.trim(),
clothPhoto,
status:"new",created:new Date().toISOString(),completedNotified:false,collectedNotified:false
};
db.orders.push(order);saveDB();closeModal("orderModal");toast("Order created successfully");renderDashboard();sendWhatsAppOrderMessage(order);showPage("orders")
};

function openCustomerDetails(customerId){
let c=db.customers.find(x=>x.id===customerId);if(!c)return;
let orders=db.orders.filter(o=>o.customerId===customerId).sort((a,b)=>b.created.localeCompare(a.created));
document.getElementById("detailsTitle").textContent=c.name;
document.getElementById("detailsSubtitle").textContent=c.phone;
document.getElementById("detailsContent").innerHTML=customerDetailsHTML(c,orders);
openModal("detailsModal");lucide.createIcons()
}
function customerDetailsHTML(c,orders){
let html=`<div class="detail-head"><div><strong>${esc(c.name)}</strong><span>${esc(c.phone)}</span></div><button class="secondary-btn" onclick="whatsappNumber('${esc(c.phone)}')"><i data-lucide="message-circle"></i> WhatsApp</button></div>`;
if(!orders.length)return html+'<div class="empty">No orders for this customer.</div>';
html+=orders.map(o=>`<div class="panel" style="margin-bottom:12px;padding:15px">
<div class="detail-head"><div><strong>${o.id}</strong><span>${new Date(o.created).toLocaleDateString("en-IN")}</span></div><span class="badge ${o.status}">${statusLabel(o.status)}</span></div>
<div class="detail-grid">
<div class="detail-box"><span>Total</span><strong>${money(o.total)}</strong></div>
<div class="detail-box"><span>Advance</span><strong>${money(o.advance)}</strong></div>
<div class="detail-box"><span>Balance</span><strong>${money(o.balance)}</strong></div>
<div class="detail-box"><span>Delivery Date</span><strong>${o.deliveryDate?new Date(o.deliveryDate+"T00:00:00").toLocaleDateString("en-IN"):"Not set"}</strong></div>
</div>
<div class="detail-section"><h3>Items</h3>${o.items.map(x=>`<div class="item-line"><span>${esc(x.name)} × ${x.qty}</span><strong>${money(x.total)}</strong></div>`).join("")}</div>
${o.instructions?`<div class="detail-section"><h3>Customer Instructions</h3><div class="instruction-box">${esc(o.instructions)}</div></div>`:""}
${o.clothPhoto?`<div class="detail-section"><h3>Cloth Sample Photo</h3><img class="detail-photo" src="${o.clothPhoto}">`:""}
<div class="detail-actions">
<button class="secondary-btn" onclick="generateBill('${o.id}')"><i data-lucide="file-text"></i> PDF Bill</button>
<button class="secondary-btn" onclick="shareBill('${o.id}')"><i data-lucide="share-2"></i> Share Bill</button>
${o.status!=="collected"?`<button class="secondary-btn" onclick="advanceStatus('${o.id}')"><i data-lucide="arrow-right"></i> ${o.status==="ready"?"Mark Collected":"Mark Ready"}</button>`:""}
${o.status==="ready"?`<button class="secondary-btn" onclick="sendReadyMessage('${o.id}')"><i data-lucide="message-circle"></i> Send Ready Message</button>`:""}
</div></div>`).join("");
return html
}

function openOrderDetails(orderId){
let o=db.orders.find(x=>x.id===orderId);if(!o)return;
let c=db.customers.find(x=>x.id===o.customerId);
openCustomerDetails(c.id)
}

function advanceStatus(id){
let o=db.orders.find(x=>x.id===id);if(!o)return;
if(o.status==="new")o.status="progress";
else if(o.status==="progress"){
o.status="ready";sendReadyMessage(id)
}else if(o.status==="ready"){
o.status="collected";sendCollectedMessage(id)
}
saveDB();toast("Order status updated");
openCustomerDetails(o.customerId);renderDashboard();renderOrders()
}

function whatsappNumber(phone){
let p=phone.replace(/\D/g,"");if(p.length===10)p="91"+p;
window.open("https://wa.me/"+p,"_blank")
}
function waText(order,text){
let p=order.phone.replace(/\D/g,"");if(p.length===10)p="91"+p;
window.open("https://wa.me/"+p+"?text="+encodeURIComponent(text),"_blank")
}
function sendWhatsAppOrderMessage(o){
waText(o,`Hello ${o.customerName}, your order ${o.id} has been successfully created at ${db.settings.name}. Total: ${money(o.total)}. Advance: ${money(o.advance)}. Balance: ${money(o.balance)}. Thank you.`);
}
function sendReadyMessage(id){
let o=db.orders.find(x=>x.id===id);if(!o)return;
o.completedNotified=true;saveDB();
waText(o,`Hello ${o.customerName}, your order ${o.id} at ${db.settings.name} is completed and ready for collection. Please visit our shop to collect your order. Thank you!`);
}
function sendCollectedMessage(id){
let o=db.orders.find(x=>x.id===id);if(!o)return;
o.collectedNotified=true;saveDB();
waText(o,`Hello ${o.customerName}, your order ${o.id} from ${db.settings.name} has been successfully collected. Thank you for visiting us. We look forward to serving you again!`);
}

function generateBill(id){
let o=db.orders.find(x=>x.id===id);if(!o)return;
const {jsPDF}=window.jspdf;
let doc=new jsPDF();
let s=db.settings;
doc.setFillColor(24,24,24);doc.rect(0,0,210,36,"F");
doc.setTextColor(255,255,255);doc.setFontSize(20);doc.setFont("helvetica","bold");doc.text(s.name,15,16);
doc.setFontSize(9);doc.setFont("helvetica","normal");doc.text(s.tagline,15,23);
doc.setTextColor(210,180,110);doc.text("INVOICE",165,17);
doc.setTextColor(255,255,255);doc.text(o.id,165,24);
doc.setTextColor(30,30,30);
let y=50;
doc.setFontSize(10);doc.setFont("helvetica","bold");doc.text("CUSTOMER",15,y);
doc.setFont("helvetica","normal");doc.text(o.customerName,15,y+7);doc.text(o.phone,15,y+13);
doc.setFont("helvetica","bold");doc.text("ORDER DATE",120,y);doc.setFont("helvetica","normal");doc.text(new Date(o.created).toLocaleDateString("en-IN"),120,y+7);
doc.setFont("helvetica","bold");doc.text("DELIVERY DATE",120,y+18);doc.setFont("helvetica","normal");doc.text(o.deliveryDate||"Not specified",120,y+25);
y=85;
doc.setFillColor(245,243,239);doc.rect(15,y-7,180,10,"F");
doc.setFont("helvetica","bold");doc.setFontSize(9);doc.text("ITEM",18,y);doc.text("QTY",130,y);doc.text("RATE",150,y);doc.text("AMOUNT",174,y);
y+=9;doc.setFont("helvetica","normal");
o.items.forEach(x=>{doc.text(x.name,18,y);doc.text(String(x.qty),132,y);doc.text(money(x.price),150,y);doc.text(money(x.total),174,y);y+=8});
y+=6;doc.line(125,y,195,y);y+=9;
doc.setFont("helvetica","bold");doc.text("TOTAL",145,y);doc.text(money(o.total),174,y);
y+=8;doc.setFont("helvetica","normal");doc.text("ADVANCE PAID",145,y);doc.text(money(o.advance),174,y);
y+=8;doc.setFont("helvetica","bold");doc.text("BALANCE DUE",145,y);doc.text(money(o.balance),174,y);
if(o.instructions){y+=18;doc.setFontSize(9);doc.text("CUSTOMER INSTRUCTIONS",15,y);doc.setFont("helvetica","normal");let lines=doc.splitTextToSize(o.instructions,175);doc.text(lines,15,y+7)}
y=260;doc.setFontSize(8);doc.setTextColor(110,110,110);doc.text(s.address||"",15,y);doc.text(s.phone?"Contact: "+s.phone:"",15,y+6);doc.text("Thank you for choosing "+s.name+".",15,y+18);
doc.save(o.id+"-Vijay-Tailors.pdf");
toast("PDF bill generated")
}

async function shareBill(id){
let o=db.orders.find(x=>x.id===id);if(!o)return;
if(!navigator.share){generateBill(id);waText(o,`Hello ${o.customerName}, your bill for order ${o.id} is ready. Please see the PDF bill downloaded on your device. Thank you.`);return}
const {jsPDF}=window.jspdf;let doc=new jsPDF();doc.text(db.settings.name,15,20);doc.text("Order: "+o.id,15,30);doc.text("Customer: "+o.customerName,15,40);doc.text("Total: "+money(o.total),15,50);doc.text("Advance: "+money(o.advance),15,60);doc.text("Balance: "+money(o.balance),15,70);
let blob=doc.output("blob");let file=new File([blob],o.id+"-Bill.pdf",{type:"application/pdf"});
try{await navigator.share({title:o.id+" Bill",text:`${db.settings.name} - ${o.id}`,files:[file]})}catch(e){}
}

function renderReports(){
let revenue=db.orders.reduce((a,o)=>a+o.total,0),adv=db.orders.reduce((a,o)=>a+o.advance,0),out=db.orders.reduce((a,o)=>a+o.balance,0);
document.getElementById("reportRevenue").textContent=money(revenue);
document.getElementById("reportAdvance").textContent=money(adv);
document.getElementById("reportOutstanding").textContent=money(out);
document.getElementById("reportCollected").textContent=db.orders.filter(o=>o.status==="collected").length;
document.getElementById("reportDetails").innerHTML=`<div class="status-list">
<div class="status-row"><span>Total Orders</span><strong>${db.orders.length}</strong></div>
<div class="status-row"><span>New</span><strong>${db.orders.filter(o=>o.status==="new").length}</strong></div>
<div class="status-row"><span>In Progress</span><strong>${db.orders.filter(o=>o.status==="progress").length}</strong></div>
<div class="status-row"><span>Ready</span><strong>${db.orders.filter(o=>o.status==="ready").length}</strong></div>
<div class="status-row"><span>Collected</span><strong>${db.orders.filter(o=>o.status==="collected").length}</strong></div>
</div>`
}

function loadSettings(){
let s=db.settings;
document.getElementById("setName").value=s.name||"";
document.getElementById("setTagline").value=s.tagline||"";
document.getElementById("setPhone").value=s.phone||"";
document.getElementById("setWhatsapp").value=s.whatsapp||"";
document.getElementById("setAddress").value=s.address||""
}
function saveSettings(){
db.settings={name:document.getElementById("setName").value.trim()||"VIJAY TAILOR'S",tagline:document.getElementById("setTagline").value.trim(),phone:document.getElementById("setPhone").value.trim(),whatsapp:document.getElementById("setWhatsapp").value.trim(),address:document.getElementById("setAddress").value.trim()};
saveDB();toast("Business settings saved")
}

renderDashboard();
