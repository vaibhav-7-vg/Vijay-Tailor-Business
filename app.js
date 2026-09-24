const pages=document.querySelectorAll(".page");
const navItems=document.querySelectorAll("[data-page]");
const toast=document.getElementById("toast");

function showPage(id){
pages.forEach(p=>p.classList.toggle("active",p.id===id));
navItems.forEach(n=>n.classList.toggle("active",n.dataset.page===id));
window.scrollTo({top:0,behavior:"smooth"});
if(id==="new-order")setTimeout(()=>lucide.createIcons(),50);
}

navItems.forEach(item=>{
item.addEventListener("click",()=>{
const page=item.dataset.page;
if(page)showPage(page);
});
});

function notify(message){
toast.querySelector("span").textContent=message;
toast.classList.add("show");
setTimeout(()=>toast.classList.remove("show"),2500);
}

document.querySelectorAll(".quick-action").forEach(btn=>{
btn.addEventListener("click",()=>{
notify("Opening "+btn.querySelector("span").textContent);
});
});

document.querySelector(".wide")?.addEventListener("click",()=>{
const inputs=document.querySelectorAll("#new-order input");
const name=inputs[0].value.trim();
if(!name){
notify("Enter customer name first");
inputs[0].focus();
return;
}
localStorage.setItem("vijay_tailors_last_customer",name);
notify("Order saved successfully");
});

lucide.createIcons();

const today=new Date();
const dateInput=document.querySelector('input[type="date"]');
if(dateInput){
const d=new Date(today.getTime()-today.getTimezoneOffset()*60000);
dateInput.value=d.toISOString().split("T")[0];
}

console.log("Vijay Tailor's Business Manager initialized.");
