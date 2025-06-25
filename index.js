const buttons = document.querySelectorAll("button[data-category]"); // FIXED (was only 1 button)
const productSection = document.getElementById("products"); // FIXED: make sure variable matches function
const url = "https://fakestoreapi.com/products";
let allproducts = [];


//step one is loading all the data when the document is opened by fetching data from the api
document.addEventListener('DOMContentLoaded', function() {
    fetch(url)
    .then(res => res.json())
    .then(data => {
        allproducts = data;
        showProducts(data);
    });
});

//step two is creatin a function that shows all products
function showProducts(products){
    productSection.innerHTML='';

    products.forEach(product => {
        const div=document.createElement("div");
        div.className='product';
        div.innerHTML=`
          <h3>${product.title}</h3>
            <p><strong>Category:</strong> ${product.category}</p>
            <p><strong>Price:</strong> ${product.price}</p>`;
            productSection.appendChild(div);
    });
}


//assuming someone whats to see all products or men's wear they can just simply click the button and the data that is stored in our api will display
//depending on the button category clicked..this has to be in a loop so for it to work we wll use a foreach loop but there has to be an event listener
//to listen for a button click

buttons.forEach(buttuon=>{
 buttuon.addEventListener('click', ()=>{
 //we must first of all get the category
 const category=buttuon.dataset.category;
 if(category==='all'){
    showProducts(allproducts);//which if you remember we had made it = to the data in api in line 12
 }else{
    const x=allproducts.filter(p=>p.category===category);//this is a boolean that will only return true values..that is it will only return if the value is = to the 
    //value in the api
    showProducts(x);
 }
 })
})